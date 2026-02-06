/**
 * JSON File Storage for Hive
 *
 * Simple, portable, version-controllable.
 * Each hex is a separate JSON file.
 */

import { readFile, writeFile, readdir, unlink, mkdir, access } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import type { Hex, HexType } from "../core/types.js";

// ============================================
// VALIDATION SCHEMA
// ============================================

const EdgeConditionSchema = z.object({
  intent: z.string().optional(),
  hasData: z.array(z.string()).optional(),
  lacks: z.array(z.string()).optional(),
  match: z.record(z.string(), z.unknown()).optional(),
  always: z.boolean().optional(),
});

const EdgeTransformSchema = z.object({
  pick: z.array(z.string()).optional(),
  omit: z.array(z.string()).optional(),
  inject: z.record(z.string(), z.unknown()).optional(),
  rename: z.record(z.string(), z.string()).optional(),
});

const EdgeSchema = z.object({
  id: z.string(),
  to: z.string(),
  when: EdgeConditionSchema,
  transform: EdgeTransformSchema.optional(),
  priority: z.number(),
  description: z.string(),
});

const HexContentsSchema = z.object({
  data: z.unknown().optional(),
  refs: z.array(z.string()).optional(),
  tools: z.array(z.unknown()).optional(),
});

const HexSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["data", "tool", "gateway", "junction"] as const),
  contents: HexContentsSchema,
  entryHints: z.array(z.string()),
  edges: z.array(EdgeSchema),
  tags: z.array(z.string()),
  description: z.string().optional(),
  created: z.string(),
  updated: z.string(),
});

// ============================================
// STORAGE CLASS
// ============================================

export class HiveStorage {
  private hexDir: string;
  private initialized: Promise<void>;

  constructor(basePath: string) {
    this.hexDir = join(basePath, "hexes");
    this.initialized = this.ensureDir();
  }

  private async ensureDir(): Promise<void> {
    try {
      await access(this.hexDir);
    } catch {
      await mkdir(this.hexDir, { recursive: true });
    }
  }

  private hexPath(id: string): string {
    return join(this.hexDir, `${id}.json`);
  }

  private async exists(path: string): Promise<boolean> {
    try {
      await access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate a hex object against the schema
   */
  validateHex(data: unknown, filename?: string): Hex | null {
    const result = HexSchema.safeParse(data);
    if (!result.success) {
      const source = filename ? `[${filename}]` : "[unknown]";
      console.error(`Hive: Invalid hex ${source}:`, result.error.flatten().fieldErrors);
      return null;
    }
    return result.data as Hex;
  }

  /**
   * Warn if edge targets don't exist (non-blocking)
   */
  async warnMissingEdgeTargets(hex: Hex): Promise<void> {
    const existingIds = await this.getHexIds();
    const existingSet = new Set(existingIds);

    for (const edge of hex.edges) {
      // Skip external targets (external:service-name)
      if (edge.to.startsWith("external:")) continue;

      if (!existingSet.has(edge.to)) {
        console.warn(`Hive: Hex "${hex.id}" has edge to non-existent hex "${edge.to}" (may be created later)`);
      }
    }
  }

  async getHex(id: string): Promise<Hex | null> {
    await this.initialized;
    const path = this.hexPath(id);

    if (!(await this.exists(path))) return null;

    try {
      const content = await readFile(path, "utf-8");
      const data = JSON.parse(content);
      return this.validateHex(data, `${id}.json`);
    } catch (err) {
      console.error(`Hive: Failed to read hex "${id}":`, err);
      return null;
    }
  }

  async saveHex(hex: Hex): Promise<void> {
    await this.initialized;
    const path = this.hexPath(hex.id);
    await writeFile(path, JSON.stringify(hex, null, 2), "utf-8");
  }

  async deleteHex(id: string): Promise<boolean> {
    await this.initialized;
    const path = this.hexPath(id);

    if (!(await this.exists(path))) return false;

    try {
      await unlink(path);
      return true;
    } catch {
      return false;
    }
  }

  async getAllHexes(): Promise<Hex[]> {
    await this.initialized;

    if (!(await this.exists(this.hexDir))) return [];

    const files = (await readdir(this.hexDir)).filter((f) => f.endsWith(".json"));
    const hexes: Hex[] = [];

    for (const file of files) {
      try {
        const content = await readFile(join(this.hexDir, file), "utf-8");
        const data = JSON.parse(content);
        const hex = this.validateHex(data, file);
        if (hex) {
          hexes.push(hex);
        }
        // If null, validateHex already logged the error
      } catch (err) {
        console.error(`Hive: Failed to parse ${file}:`, err);
      }
    }

    return hexes;
  }

  async getHexIds(): Promise<string[]> {
    await this.initialized;

    if (!(await this.exists(this.hexDir))) return [];

    const files = await readdir(this.hexDir);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""));
  }
}
