# Hive - Project Instructions

## What Is This?

**Hive is agent-native navigation infrastructure.** Not a UI dashboard. Not a chatbot manager. It's a semantic graph that AI agents pathfind through.

The honeycomb isn't for humans to click — it's a **data structure agents traverse**.

---

## Core Concept

```
Agent says: "I need customer Q4 data"
     ↓
Hive returns: best hex entry point
     ↓
Agent enters hex, gets contents
     ↓
Agent says: "now I need revenue context"
     ↓
Hive evaluates edge conditions, returns matching route
     ↓
Agent traverses edge to next hex (or external system)
```

**Key insight:** Edges encode "when this → do that" logic. The topology IS the executable logic. Agents don't search — they pathfind.

---

## Current State (as of 2026-02-06)

### What Exists
- `src/core/types.ts` — Hex, Edge, Journey schemas
- `src/core/hive.ts` — Query, enter, traverse, deposit API
- `src/storage/json-storage.ts` — JSON file persistence
- `src/demo.ts` — Working proof of concept
- `hexes/` — 4 example hexes created by demo

### What Works
```bash
pnpm demo  # Creates hexes, simulates agent navigation
```

### What's Next
**BUILD THE MCP SERVER** — expose Hive as tools Claude Code can call directly.

---

## The API

```typescript
import { Hive } from "./src/index.js";

const hive = new Hive("./");  // path to where hexes/ folder lives

// "I need X" → returns best entry points
await hive.query("customer Q4 metrics");

// Navigate to hex, get contents
await hive.enter("customer-data-q4", context);

// "Where can I go from here?" → returns matching edges
await hive.nextSteps("customer-data-q4", { intent: "revenue context" });

// Follow an edge
await hive.traverse("customer-data-q4", "to-finance", context);

// Leave data at a hex
await hive.deposit("finance-reports", newData);

// Create a new hex
await hive.createHex({ id, name, type, contents, entryHints, edges, tags });
```

---

## MCP Server Requirements

Create `src/mcp-server.ts` that exposes these tools:

| Tool | Purpose |
|------|---------|
| `hive_query` | Find hexes matching an intent |
| `hive_enter` | Get a hex's contents |
| `hive_next_steps` | Get available edges from current hex |
| `hive_traverse` | Follow an edge to next destination |
| `hive_deposit` | Leave data at a hex |
| `hive_create_hex` | Create a new hex |
| `hive_list_hexes` | List all hexes in the graph |

Use the official MCP SDK: `@modelcontextprotocol/sdk`

The server should:
1. Initialize Hive with the project's `hexes/` directory
2. Expose each API method as an MCP tool
3. Return structured JSON responses

---

## File Structure

```
hive/
├── src/
│   ├── core/
│   │   ├── types.ts        # ✅ Done
│   │   └── hive.ts         # ✅ Done
│   ├── storage/
│   │   └── json-storage.ts # ✅ Done
│   ├── index.ts            # ✅ Done
│   ├── demo.ts             # ✅ Done
│   └── mcp-server.ts       # ← BUILD THIS
├── hexes/                   # ✅ Created by demo
├── planning-archive/        # Old docs, ignore
├── package.json
├── tsconfig.json
└── CLAUDE.md               # You are here
```

---

## Obsidian Docs

Full project documentation: `C:\Users\Owner\workspace\Obsidian\Projects\Hive\`
- `INDEX.md` — Project manifest
- `architecture/INDEX.md` — Schemas, data flow
- `sessions/2026-02-06-initial-build.md` — Today's session log

---

## Commands

```bash
pnpm demo      # Run the demo (creates hexes, simulates navigation)
pnpm build     # Compile TypeScript
```

---

## Don't Do These Things

- Don't build a React UI first — agents come before humans
- Don't over-engineer — the current simple word-overlap matching is fine for now
- Don't add embeddings/vector search yet — that's future optimization
- Don't forget: edges contain the logic, hexes are just containers
