/**
 * Hive Demo
 *
 * Shows how an agent navigates the honeycomb.
 */

import { Hive, Hex, AgentContext } from "./index.js";

async function main() {
  console.log("🐝 Hive Demo\n");

  // Initialize Hive with local storage
  const hive = new Hive("./");

  // ============================================
  // 1. CREATE SOME HEXES
  // ============================================
  console.log("Creating hexes...\n");

  // Data hex: Customer Q4 data
  await hive.createHex({
    id: "customer-data-q4",
    name: "Customer Data Q4",
    type: "data",
    contents: {
      data: {
        customers: 1250,
        revenue: 450000,
        churn: 0.03,
        topAccounts: ["Acme Corp", "Globex", "Initech"],
      },
    },
    entryHints: ["customer metrics", "Q4 data", "sales figures", "customer count"],
    edges: [
      {
        id: "to-finance",
        to: "finance-reports",
        when: { intent: "revenue context" },
        priority: 10,
        description: "Go to finance for revenue breakdown",
      },
      {
        id: "to-crm",
        to: "external:salesforce",
        when: { intent: "update CRM" },
        transform: { pick: ["topAccounts"] },
        priority: 5,
        description: "Push top accounts to Salesforce",
      },
    ],
    tags: ["data", "customers", "q4"],
  });

  // Data hex: Finance reports
  await hive.createHex({
    id: "finance-reports",
    name: "Finance Reports",
    type: "data",
    contents: {
      data: {
        quarters: {
          q3: { revenue: 380000, expenses: 320000 },
          q4: { revenue: 450000, expenses: 350000 },
        },
        growth: 0.18,
      },
    },
    entryHints: ["revenue", "financial data", "quarterly reports", "expenses"],
    edges: [
      {
        id: "to-exec-summary",
        to: "exec-summary",
        when: { intent: "executive summary" },
        transform: { pick: ["growth"] },
        priority: 10,
        description: "Summarize for executives",
      },
    ],
    tags: ["finance", "reports"],
  });

  // Junction hex: Router based on payload
  await hive.createHex({
    id: "data-router",
    name: "Data Router",
    type: "junction",
    contents: {},
    entryHints: ["route data", "where should this go"],
    edges: [
      {
        id: "route-to-customers",
        to: "customer-data-q4",
        when: { match: { type: "customer" } },
        priority: 10,
        description: "Route customer-related data",
      },
      {
        id: "route-to-finance",
        to: "finance-reports",
        when: { match: { type: "financial" } },
        priority: 10,
        description: "Route financial data",
      },
    ],
    tags: ["routing", "junction"],
  });

  // Gateway hex: Salesforce
  await hive.createHex({
    id: "salesforce-gateway",
    name: "Salesforce Gateway",
    type: "gateway",
    contents: {
      tools: [
        {
          name: "updateAccounts",
          description: "Update account records in Salesforce",
          parameters: {
            accounts: { type: "array", description: "Account names", required: true },
          },
          handler: "salesforce:updateAccounts",
        },
      ],
    },
    entryHints: ["CRM", "salesforce", "update accounts", "sync CRM"],
    edges: [],
    tags: ["gateway", "external", "salesforce"],
  });

  console.log("Created 4 hexes.\n");

  // ============================================
  // 2. SIMULATE AGENT NAVIGATION
  // ============================================
  console.log("=".repeat(50));
  console.log("AGENT JOURNEY: Get Q4 customer data\n");

  const context: AgentContext = {
    intent: "customer Q4 metrics",
    origin: "demo-agent",
    payload: {},
    visited: [],
    depth: 0,
  };

  // Step 1: Query for entry point
  console.log("1. Agent queries: 'customer Q4 metrics'");
  const results = await hive.query("customer Q4 metrics");
  console.log(`   Found ${results.length} matching hexes:`);
  for (const r of results) {
    console.log(`   - ${r.hex.name} (score: ${r.score.toFixed(2)}, hints: ${r.matchedHints.join(", ")})`);
  }

  if (results.length === 0) {
    console.log("No hexes found!");
    return;
  }

  // Step 2: Enter the best match
  const bestMatch = results[0].hex;
  console.log(`\n2. Agent enters: ${bestMatch.name}`);
  const entered = await hive.enter(bestMatch.id, context);
  if (entered) {
    console.log(`   Contents: ${JSON.stringify(entered.contents.data, null, 2).slice(0, 100)}...`);
  }

  // Step 3: Ask for next steps
  console.log("\n3. Agent asks: 'where can I go next?'");
  context.intent = "revenue context";
  const edges = await hive.nextSteps(bestMatch.id, context);
  console.log(`   Available edges:`);
  for (const edge of edges) {
    console.log(`   - ${edge.id} → ${edge.to} (when: ${JSON.stringify(edge.when)})`);
  }

  // Step 4: Traverse to next hex
  if (edges.length > 0) {
    const edge = edges[0];
    console.log(`\n4. Agent traverses: ${edge.id} → ${edge.to}`);
    const result = await hive.traverse(bestMatch.id, edge.id, context);
    console.log(`   Success: ${result.success}`);
    console.log(`   Destination: ${result.destination}`);
    console.log(`   External: ${result.external || false}`);
  }

  // Show journey
  console.log("\n" + "=".repeat(50));
  console.log("JOURNEY LOG:\n");
  const journey = hive.getJourney("demo-agent");
  if (journey) {
    for (const step of journey.steps) {
      console.log(`  [${step.action.toUpperCase()}] ${step.hexId}`);
    }
  }

  console.log("\n✅ Demo complete.");
}

main().catch(console.error);
