/**
 * Hive Core
 *
 * The main interface for agents to interact with the honeycomb.
 * Query, navigate, traverse, deposit.
 */

import { appendFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  Hex,
  Edge,
  EdgeCondition,
  EdgeTransform,
  AgentContext,
  QueryResult,
  TraversalResult,
  Journey,
  JourneyStep,
} from "./types.js";
import { HiveStorage } from "../storage/json-storage.js";

// ============================================
// CONCEPT MAP — Lightweight synonym expansion
// ============================================

const CONCEPT_MAP: Record<string, string[]> = {
  button: ["interactive", "form", "click", "input", "ui", "element"],
  deploy: ["ship", "ops", "launch", "release", "production", "ci", "cd"],
  database: ["schema", "data", "table", "model", "prisma", "sql"],
  style: ["css", "design", "theme", "color", "token", "tailwind"],
  auth: ["login", "signup", "session", "permission", "security", "authentication"],
  test: ["qa", "quality", "check", "audit", "verify", "testing"],
  api: ["backend", "server", "endpoint", "route", "action", "rest"],
  layout: ["spacing", "grid", "responsive", "breakpoint", "flex", "gap"],
  text: ["typography", "font", "heading", "copy", "writing"],
  image: ["performance", "optimization", "loading", "asset", "media"],
  error: ["handling", "validation", "message", "boundary", "catch"],
  form: ["input", "validation", "field", "submit", "interactive"],
  component: ["ui", "element", "widget", "block", "module"],
  animation: ["motion", "transition", "hover", "easing", "duration"],
  color: ["theme", "palette", "token", "dark", "light", "mode"],
  accessibility: ["a11y", "wcag", "aria", "screen", "reader", "keyboard", "focus"],
  seo: ["search", "meta", "og", "social", "crawl", "sitemap"],
  setup: ["scaffold", "init", "initialize", "new", "project", "start"],
  code: ["typescript", "react", "standards", "patterns", "naming"],
  copy: ["writing", "ux", "microcopy", "label", "message", "voice"],
};

export class Hive {
  private storage: HiveStorage;
  private journeys: Map<string, Journey> = new Map();
  private storagePath: string;
  private journeyLogPath: string;

  constructor(storagePath: string) {
    this.storagePath = storagePath;
    this.storage = new HiveStorage(storagePath);
    this.journeyLogPath = join(storagePath, "journeys.jsonl");
  }

  // ============================================
  // QUERY — "I need X" → returns best entry points
  // ============================================

  async query(intent: string, limit = 5): Promise<QueryResult[]> {
    const hexes = await this.storage.getAllHexes();
    const results: QueryResult[] = [];

    const intentWords = this.tokenize(intent);
    const expandedIntent = this.expandWithSynonyms(intentWords);

    for (const hex of hexes) {
      const matchedHints: string[] = [];
      let score = 0;

      // Check entry hints
      for (const hint of hex.entryHints) {
        const hintWords = this.tokenize(hint);
        const expandedHint = this.expandWithSynonyms(hintWords);
        const overlap = this.wordOverlap(expandedIntent, expandedHint);
        if (overlap > 0) {
          matchedHints.push(hint);
          score += overlap;
        }
      }

      // Check name and description
      const nameWords = this.tokenize(hex.name);
      const expandedName = this.expandWithSynonyms(nameWords);
      const nameOverlap = this.wordOverlap(expandedIntent, expandedName);
      score += nameOverlap * 0.5;

      if (hex.description) {
        const descWords = this.tokenize(hex.description);
        const expandedDesc = this.expandWithSynonyms(descWords);
        const descOverlap = this.wordOverlap(expandedIntent, expandedDesc);
        score += descOverlap * 0.3;
      }

      // Check tags
      for (const tag of hex.tags) {
        if (expandedIntent.includes(tag.toLowerCase())) {
          score += 0.5;
        }
      }

      if (score > 0) {
        results.push({ hex, score, matchedHints });
      }
    }

    // Sort by score, return top N
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // ============================================
  // ENTER — Navigate to a hex, get its contents
  // ============================================

  async enter(hexId: string, context?: AgentContext): Promise<Hex | null> {
    const hex = await this.storage.getHex(hexId);

    if (hex && context) {
      await this.logStep(context, {
        hexId,
        action: "enter",
        timestamp: new Date().toISOString(),
        payload: context.payload,
      });
    }

    return hex;
  }

  // ============================================
  // NEXT STEPS — "I have X, where can I go?"
  // ============================================

  async nextSteps(hexId: string, context: AgentContext): Promise<Edge[]> {
    const hex = await this.storage.getHex(hexId);
    if (!hex) return [];

    const matchingEdges: Edge[] = [];

    for (const edge of hex.edges) {
      if (this.evaluateCondition(edge.when, context)) {
        matchingEdges.push(edge);
      }
    }

    // Sort by priority (higher first)
    return matchingEdges.sort((a, b) => b.priority - a.priority);
  }

  // ============================================
  // TRAVERSE — Follow an edge to the next hex
  // ============================================

  async traverse(
    fromHexId: string,
    edgeId: string,
    context: AgentContext
  ): Promise<TraversalResult> {
    const hex = await this.storage.getHex(fromHexId);
    if (!hex) {
      return { success: false, destination: "", error: "Source hex not found" };
    }

    const edge = hex.edges.find((e) => e.id === edgeId);
    if (!edge) {
      return { success: false, destination: "", error: "Edge not found" };
    }

    // Check if condition still holds
    if (!this.evaluateCondition(edge.when, context)) {
      return {
        success: false,
        destination: edge.to,
        error: "Edge condition not met"
      };
    }

    // Apply transformation if specified
    let payload = context.payload;
    if (edge.transform) {
      payload = this.applyTransform(payload, edge.transform);
    }

    // Log the traversal
    await this.logStep(context, {
      hexId: fromHexId,
      action: "exit",
      timestamp: new Date().toISOString(),
      edgeId,
      payload,
    });

    // Check if external gateway
    const isExternal = edge.to.startsWith("external:");

    return {
      success: true,
      destination: edge.to,
      payload,
      external: isExternal,
    };
  }

  // ============================================
  // DEPOSIT — Leave data at a hex
  // ============================================

  async deposit(hexId: string, data: unknown, context?: AgentContext): Promise<boolean> {
    const hex = await this.storage.getHex(hexId);
    if (!hex) return false;

    // Merge data into hex contents
    const existingData = hex.contents.data;
    if (Array.isArray(existingData) && Array.isArray(data)) {
      hex.contents.data = [...existingData, ...data];
    } else if (typeof existingData === "object" && typeof data === "object") {
      hex.contents.data = { ...(existingData as object), ...(data as object) };
    } else {
      hex.contents.data = data;
    }

    hex.updated = new Date().toISOString();
    await this.storage.saveHex(hex);

    if (context) {
      await this.logStep(context, {
        hexId,
        action: "deposit",
        timestamp: new Date().toISOString(),
        payload: data,
      });
    }

    return true;
  }

  // ============================================
  // HEX MANAGEMENT
  // ============================================

  async createHex(hex: Omit<Hex, "created" | "updated">): Promise<Hex> {
    const now = new Date().toISOString();
    const fullHex: Hex = {
      ...hex,
      created: now,
      updated: now,
    };

    // Warn about missing edge targets (non-blocking)
    await this.storage.warnMissingEdgeTargets(fullHex);

    await this.storage.saveHex(fullHex);
    return fullHex;
  }

  async getHex(id: string): Promise<Hex | null> {
    return this.storage.getHex(id);
  }

  async listHexes(): Promise<Hex[]> {
    return this.storage.getAllHexes();
  }

  async deleteHex(id: string): Promise<boolean> {
    return this.storage.deleteHex(id);
  }

  // ============================================
  // JOURNEY LOG — Persistent audit trail
  // ============================================

  async getJourneyLog(limit = 100): Promise<JourneyStep[]> {
    try {
      const content = await readFile(this.journeyLogPath, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);
      const steps = lines.map((line) => JSON.parse(line) as JourneyStep);
      return steps.slice(-limit);
    } catch {
      return [];
    }
  }

  getJourney(id: string): Journey | undefined {
    return this.journeys.get(id);
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2);
  }

  /**
   * Expand words with synonyms from the concept map
   */
  private expandWithSynonyms(words: string[]): string[] {
    const expanded = new Set(words);

    for (const word of words) {
      // Check if word is a key in concept map
      if (CONCEPT_MAP[word]) {
        for (const synonym of CONCEPT_MAP[word]) {
          expanded.add(synonym);
        }
      }

      // Check if word appears as a value in concept map
      for (const [key, synonyms] of Object.entries(CONCEPT_MAP)) {
        if (synonyms.includes(word)) {
          expanded.add(key);
          for (const synonym of synonyms) {
            expanded.add(synonym);
          }
        }
      }
    }

    return Array.from(expanded);
  }

  private wordOverlap(a: string[], b: string[]): number {
    const setB = new Set(b);
    return a.filter((w) => setB.has(w)).length;
  }

  private evaluateCondition(condition: EdgeCondition, context: AgentContext): boolean {
    // Always passes
    if (condition.always) return true;

    // Check intent match (with synonym expansion)
    if (condition.intent && context.intent) {
      const conditionWords = this.tokenize(condition.intent);
      const expandedCondition = this.expandWithSynonyms(conditionWords);
      const intentWords = this.tokenize(context.intent);
      const expandedIntent = this.expandWithSynonyms(intentWords);
      if (this.wordOverlap(expandedCondition, expandedIntent) === 0) {
        return false;
      }
    }

    // Check hasData
    if (condition.hasData && context.payload) {
      const payloadKeys = Object.keys(context.payload as object);
      const hasAll = condition.hasData.every((key) => payloadKeys.includes(key));
      if (!hasAll) return false;
    }

    // Check lacks
    if (condition.lacks && context.payload) {
      const payloadKeys = Object.keys(context.payload as object);
      const lacksAny = condition.lacks.some((key) => !payloadKeys.includes(key));
      if (!lacksAny) return false;
    }

    // Check match
    if (condition.match && context.payload) {
      const payload = context.payload as Record<string, unknown>;
      for (const [key, value] of Object.entries(condition.match)) {
        if (payload[key] !== value) return false;
      }
    }

    return true;
  }

  private applyTransform(payload: unknown, transform: EdgeTransform): unknown {
    if (!payload || typeof payload !== "object") return payload;

    let result = { ...(payload as Record<string, unknown>) };

    // Pick specific fields
    if (transform.pick) {
      const picked: Record<string, unknown> = {};
      for (const key of transform.pick) {
        if (key in result) picked[key] = result[key];
      }
      result = picked;
    }

    // Omit fields
    if (transform.omit) {
      for (const key of transform.omit) {
        delete result[key];
      }
    }

    // Rename fields
    if (transform.rename) {
      for (const [from, to] of Object.entries(transform.rename)) {
        if (from in result) {
          result[to] = result[from];
          delete result[from];
        }
      }
    }

    // Inject additional data
    if (transform.inject) {
      result = { ...result, ...transform.inject };
    }

    return result;
  }

  private async logStep(context: AgentContext, step: JourneyStep): Promise<void> {
    const journeyId = context.origin || "anonymous";

    // In-memory tracking
    if (!this.journeys.has(journeyId)) {
      this.journeys.set(journeyId, {
        id: journeyId,
        agentId: journeyId,
        started: new Date().toISOString(),
        steps: [],
        status: "active",
      });
    }
    this.journeys.get(journeyId)!.steps.push(step);

    // Persist to JSONL
    const logEntry = { ...step, journeyId };
    try {
      await appendFile(this.journeyLogPath, JSON.stringify(logEntry) + "\n", "utf-8");
    } catch {
      // Ignore write errors — logging should never break navigation
    }
  }
}
