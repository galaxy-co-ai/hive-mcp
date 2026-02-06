#!/usr/bin/env node
/**
 * Hive MCP Server
 *
 * Exposes Hive as MCP tools for Claude Code to call directly.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { Hive } from "./index.js";

// Initialize Hive with the hexes directory
const hive = new Hive("./");

// Create MCP server
const server = new McpServer({
  name: "hive",
  version: "0.1.0",
});

// ============================================
// TOOLS
// ============================================

// hive_query - Find hexes matching an intent
server.tool(
  "hive_query",
  "Find hexes matching a semantic intent. Returns entry points sorted by relevance.",
  {
    intent: z.string().describe("What the agent is looking for (e.g., 'customer Q4 metrics')"),
    limit: z.number().optional().describe("Max results to return (default: 5)"),
  },
  async ({ intent, limit }) => {
    const results = await hive.query(intent, limit);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            results.map((r) => ({
              id: r.hex.id,
              name: r.hex.name,
              type: r.hex.type,
              score: r.score,
              matchedHints: r.matchedHints,
              description: r.hex.description,
            })),
            null,
            2
          ),
        },
      ],
    };
  }
);

// hive_enter - Get a hex's contents
server.tool(
  "hive_enter",
  "Navigate to a hex and retrieve its contents.",
  {
    hexId: z.string().describe("The hex ID to enter"),
    intent: z.string().optional().describe("Current agent intent"),
    payload: z.record(z.string(), z.unknown()).optional().describe("Data the agent is carrying"),
  },
  async ({ hexId, intent, payload }) => {
    const context = intent || payload ? { intent, payload } : undefined;
    const hex = await hive.enter(hexId, context);

    if (!hex) {
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ error: "Hex not found" }) }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              id: hex.id,
              name: hex.name,
              type: hex.type,
              contents: hex.contents,
              edges: hex.edges.map((e) => ({
                id: e.id,
                to: e.to,
                description: e.description,
                priority: e.priority,
              })),
              tags: hex.tags,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// hive_next_steps - Get available edges from current hex
server.tool(
  "hive_next_steps",
  "Get edges available from a hex, filtered by agent context. Returns only edges whose conditions match.",
  {
    hexId: z.string().describe("Current hex ID"),
    intent: z.string().optional().describe("What the agent wants to do next"),
    payload: z.record(z.string(), z.unknown()).optional().describe("Data the agent is carrying"),
  },
  async ({ hexId, intent, payload }) => {
    const context = { intent, payload };
    const edges = await hive.nextSteps(hexId, context);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            edges.map((e) => ({
              id: e.id,
              to: e.to,
              description: e.description,
              priority: e.priority,
              when: e.when,
            })),
            null,
            2
          ),
        },
      ],
    };
  }
);

// hive_traverse - Follow an edge to next destination
server.tool(
  "hive_traverse",
  "Follow an edge from a hex to its destination. Applies any transformations to the payload.",
  {
    hexId: z.string().describe("Source hex ID"),
    edgeId: z.string().describe("Edge ID to follow"),
    intent: z.string().optional().describe("Current agent intent"),
    payload: z.record(z.string(), z.unknown()).optional().describe("Data the agent is carrying"),
  },
  async ({ hexId, edgeId, intent, payload }) => {
    const context = { intent, payload };
    const result = await hive.traverse(hexId, edgeId, context);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
      isError: !result.success,
    };
  }
);

// hive_deposit - Leave data at a hex
server.tool(
  "hive_deposit",
  "Deposit data at a hex. Merges with existing contents.",
  {
    hexId: z.string().describe("Target hex ID"),
    data: z.unknown().describe("Data to deposit"),
  },
  async ({ hexId, data }) => {
    const success = await hive.deposit(hexId, data);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ success, hexId }),
        },
      ],
      isError: !success,
    };
  }
);

// hive_create_hex - Create a new hex
server.tool(
  "hive_create_hex",
  "Create a new hex in the hive.",
  {
    id: z.string().describe("Unique hex identifier (kebab-case)"),
    name: z.string().describe("Human-readable name"),
    type: z.enum(["data", "tool", "gateway", "junction"]).describe("Hex type"),
    entryHints: z.array(z.string()).describe("Semantic triggers for when agents should enter"),
    tags: z.array(z.string()).describe("Categorization tags"),
    description: z.string().optional().describe("What this hex is for"),
    contents: z
      .object({
        data: z.unknown().optional(),
        refs: z.array(z.string()).optional(),
      })
      .optional()
      .describe("Initial contents"),
    edges: z
      .array(
        z.object({
          id: z.string(),
          to: z.string(),
          description: z.string(),
          priority: z.number(),
          when: z.object({
            intent: z.string().optional(),
            hasData: z.array(z.string()).optional(),
            lacks: z.array(z.string()).optional(),
            match: z.record(z.string(), z.unknown()).optional(),
            always: z.boolean().optional(),
          }),
        })
      )
      .optional()
      .describe("Outbound edges"),
  },
  async ({ id, name, type, entryHints, tags, description, contents, edges }) => {
    const hex = await hive.createHex({
      id,
      name,
      type,
      entryHints,
      tags,
      description,
      contents: contents || { data: null },
      edges: edges || [],
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ success: true, hex: { id: hex.id, name: hex.name, type: hex.type } }, null, 2),
        },
      ],
    };
  }
);

// hive_list_hexes - List all hexes in the graph
server.tool(
  "hive_list_hexes",
  "List all hexes in the hive with their basic info.",
  {},
  async () => {
    const hexes = await hive.listHexes();

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            hexes.map((h) => ({
              id: h.id,
              name: h.name,
              type: h.type,
              tags: h.tags,
              edgeCount: h.edges.length,
              description: h.description,
            })),
            null,
            2
          ),
        },
      ],
    };
  }
);

// hive_journey_log - Get recent journey steps
server.tool(
  "hive_journey_log",
  "Get recent agent navigation steps from the journey log. Useful for auditing and debugging agent paths.",
  {
    limit: z.number().optional().describe("Max entries to return (default: 100)"),
  },
  async ({ limit }) => {
    const steps = await hive.getJourneyLog(limit);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(steps, null, 2),
        },
      ],
    };
  }
);

// ============================================
// START SERVER
// ============================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Hive MCP server running");
}

main().catch(console.error);
