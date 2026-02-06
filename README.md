# Hive

Agent-native navigation infrastructure. A semantic graph AI agents pathfind through.

## What is Hive?

Hive is not a UI dashboard or chatbot manager. It's a **data structure agents traverse**.

```
Agent: "I need button styling rules"
     ↓
Hive: returns best hex entry point
     ↓
Agent: enters hex, gets contents
     ↓
Agent: "now I need accessibility context"
     ↓
Hive: evaluates edge conditions, returns matching route
     ↓
Agent: traverses edge to next hex
```

Edges encode "when this → do that" logic. The topology IS the executable logic. Agents don't search — they pathfind.

## Installation

```bash
npm install @thunderbird-dev/hive
```

## Usage with Claude Code

Add Hive as an MCP server:

```bash
claude mcp add hive -- npx @thunderbird-dev/hive
```

Then in Claude Code, you'll have access to these tools:

| Tool | Purpose |
|------|---------|
| `hive_query` | Find hexes matching an intent |
| `hive_enter` | Get a hex's contents |
| `hive_next_steps` | Get available edges from current hex |
| `hive_traverse` | Follow an edge to next destination |
| `hive_deposit` | Leave data at a hex |
| `hive_create_hex` | Create a new hex |
| `hive_list_hexes` | List all hexes in the graph |
| `hive_journey_log` | View navigation history |

## Programmatic Usage

```typescript
import { Hive } from "@thunderbird-dev/hive";

const hive = new Hive("./");

// Query for entry points
const results = await hive.query("button styling rules");

// Enter a hex
const hex = await hive.enter("constitution-interactive-elements", {
  agentId: "my-agent",
  intent: "learn button patterns"
});

// Get next steps
const edges = await hive.nextSteps("constitution-interactive-elements", {
  intent: "accessibility requirements"
});

// Traverse an edge
await hive.traverse("constitution-interactive-elements", "to-accessibility", context);
```

## Included Content

Hive ships with the **Engineering Constitution** — 19 hexes covering:

- UI Foundations, Typography, Interactive Elements
- Motion, Color System, Layout & Spacing
- Accessibility, Performance, Code Standards
- Backend API, Data Layer, Testing & QA
- Ops & Ship, Growth & Launch, Project Setup
- Design System, Strategy & Scope, Copy & Voice

## Creating Custom Hexes

```typescript
await hive.createHex({
  id: "my-custom-hex",
  name: "My Custom Hex",
  type: "data",
  contents: {
    data: { rules: "Your content here" }
  },
  entryHints: ["keywords", "that", "match", "this", "hex"],
  edges: [
    {
      id: "to-related",
      to: "another-hex-id",
      when: { intent: "related topic keywords" },
      priority: 5,
      description: "Navigate to related content"
    }
  ],
  tags: ["custom", "example"]
});
```

## License

MIT
