/**
 * Hive Core Types
 *
 * The honeycomb is a directed graph with conditional edges.
 * Agents don't search — they pathfind through semantic topology.
 */

// ============================================
// HEX TYPES
// ============================================

export type HexType =
  | "data"      // Stores information
  | "tool"      // Exposes a capability (API caller, file writer, etc.)
  | "gateway"   // Connects to external systems
  | "junction"; // Pure routing logic

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, ParameterDef>;
  handler: string; // Reference to executable (file path, function name, etc.)
}

export interface ParameterDef {
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required?: boolean;
  default?: unknown;
}

export interface HexContents {
  data?: unknown;                    // Actual payload
  refs?: string[];                   // Pointers to files, URLs, other hexes
  tools?: ToolDefinition[];          // Callable functions
}

export interface Hex {
  id: string;                        // Unique identifier: "customer-data-q4"
  name: string;                      // Human-readable label
  type: HexType;

  contents: HexContents;

  // Semantic triggers — when should an agent come here?
  entryHints: string[];              // ["customer metrics", "Q4 data", "sales figures"]

  // Outbound connections
  edges: Edge[];

  // Metadata
  tags: string[];
  description?: string;
  created: string;
  updated: string;
}

// ============================================
// EDGE TYPES (the "when this → do that" logic)
// ============================================

export interface EdgeCondition {
  intent?: string;                   // "needs revenue context"
  hasData?: string[];                // Agent is carrying certain data types
  lacks?: string[];                  // Agent needs something it doesn't have
  match?: Record<string, unknown>;   // Payload matches these values
  always?: boolean;                  // Unconditional edge
}

export interface EdgeTransform {
  pick?: string[];                   // Only carry these fields forward
  omit?: string[];                   // Drop these fields
  inject?: Record<string, unknown>;  // Add context to payload
  rename?: Record<string, string>;   // Rename fields
}

export interface Edge {
  id: string;
  to: string;                        // Destination hex ID or "external:service-name"

  when: EdgeCondition;
  transform?: EdgeTransform;

  priority: number;                  // Higher = evaluated first
  description: string;               // Human-readable explanation
}

// ============================================
// AGENT CONTEXT
// ============================================

export interface AgentContext {
  intent?: string;                   // What the agent is trying to do
  payload?: unknown;                 // Data the agent is carrying
  visited?: string[];                // Hexes already visited (cycle detection)
  origin?: string;                   // Where the agent started
  depth?: number;                    // How many hops so far
}

// ============================================
// API RESULTS
// ============================================

export interface QueryResult {
  hex: Hex;
  score: number;                     // Match confidence
  matchedHints: string[];            // Which hints matched
}

export interface TraversalResult {
  success: boolean;
  destination: string;               // Hex ID or external target
  payload?: unknown;                 // Transformed payload
  external?: boolean;                // Was this an external gateway?
  error?: string;
}

export interface JourneyStep {
  hexId: string;
  action: "enter" | "exit" | "deposit" | "query";
  timestamp: string;
  payload?: unknown;
  edgeId?: string;
}

export interface Journey {
  id: string;
  agentId: string;
  started: string;
  ended?: string;
  steps: JourneyStep[];
  status: "active" | "completed" | "failed";
}
