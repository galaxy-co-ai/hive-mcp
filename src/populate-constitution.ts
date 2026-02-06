/**
 * Populate Hive with Engineering Constitution
 *
 * Creates a hub hex + 18 domain hexes from the constitution files.
 * Run once to seed the graph: pnpm tsx src/populate-constitution.ts
 */

import { Hive } from "./index.js";

const hive = new Hive("./");

// ============================================
// CONSTITUTION CONTENT
// ============================================

const constitution = {
  // Global non-negotiables from the CLAUDE.md
  globalRules: `## Global Non-Negotiables (Always Applied)

These apply to EVERY file, EVERY component, EVERY commit:

### Code
1. TypeScript strict mode. No \`any\` types. Zod validation on all external data.
2. Every server action returns \`{ success: true, data } | { success: false, error }\`. No exceptions thrown to client.
3. Auth check is the FIRST line of every protected server action and API route.
4. All env vars validated with Zod at startup. Missing var = app doesn't start.

### UI
5. Every interactive element must have: hover state, active/pressed state, focus-visible state, and disabled state.
6. All spacing uses the 4px grid: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128.
7. No orphan styles. Every style belongs to a design token or a component.
8. Mobile-first responsive. Start at 320px, scale up.
9. \`-webkit-font-smoothing: antialiased\` and \`text-rendering: optimizeLegibility\` on body.
10. \`box-sizing: border-box\` globally applied.
11. No dead click areas — expand padding, not margin.
12. \`user-select: none\` on interactive element labels. \`pointer-events: none\` on decorative elements.

### Copy
13. Button labels use verb + noun ("Create project" not "Submit").
14. Error messages follow: what happened + why + what to do next.
15. Never use "successfully" — it's always redundant.
16. Sentence case everywhere. No Title Case except brand names.

### Quality
17. No \`console.log\` in production code. Use structured logging server-side.
18. Every LLM call has \`maxTokens\` set and rate limiting applied.
19. Every webhook verifies signature before processing.`,

  strategyScope: `# Strategy & Scope

Applied before building anything. Skip this and you build the wrong thing well.

## DEFINE_THE_JOB
- WHEN: Starting any new product or feature
- DO: Complete: "When [person] is [situation], they want [outcome] so they can [motivation]."
- WHY: Undefined jobs produce feature soup.
- NEVER: Start building because a feature "seems cool."

## MVP_BOUNDARY
- WHEN: Scoping what to build
- DO: Define MUST HAVE (3-5 launch blockers), SHOULD HAVE (fast-follow), WON'T HAVE (explicit no).
- WHY: Undefined scope expands infinitely. Ship MVP in 2-4 weeks.
- NEVER: Start without a written won't-have list.

## ONE_USER_ONE_FLOW
- WHEN: Designing v1
- DO: Optimize for ONE user type completing ONE primary flow.
- NEVER: Build for multiple personas in v1.

## SHIP_DATE
- WHEN: Starting any project
- DO: Set a ship date. If you'll miss it, cut scope — don't move the date.
- NEVER: Push the date — cut features instead.`,

  designSystem: `# Design System

Applied when defining visual identity for a specific product.

## TOKEN_DEFINITION
- WHEN: Starting a new product
- DO: Define before building: COLORS (Primary, Background, Surface, Text, Borders, Accent, Destructive, Success, Warning), TYPOGRAPHY (Heading, Body, Mono fonts), BORDER RADIUS (Small, Medium, Large), SHADOWS (Subtle, Medium, Large).
- NEVER: Start building UI without defined tokens.

## FONT_SELECTION
Choose based on personality:
- Technical/Developer: Mono or geometric sans (JetBrains Mono, Inter, Space Grotesk)
- Professional/Enterprise: Clean neo-grotesque (Inter, Geist, SF Pro)
- Warm/Consumer: Humanist sans (Source Sans, Nunito, DM Sans)
Maximum 2 font families. Load from next/font.

## COLOR_PALETTE_CREATION
Start with ONE primary color. Derive everything else. Test in light AND dark mode before building.

## COMPONENT_LIBRARY
Use shadcn/ui as starting point. Install only needed components. Customize tokens to match your design system.

## ICON_SYSTEM
Pick ONE icon library (Lucide React recommended). Consistent sizing: 16px inline, 20px buttons/nav, 24px feature icons.`,

  uiFoundations: `# UI Foundations

Applied when creating any new component, page, or layout.

## Component Checklist
- [ ] Renders correctly at 320px, 768px, 1024px, 1440px
- [ ] No hardcoded pixel widths on containers
- [ ] Interactive states implemented (hover, active, focus-visible, disabled)
- [ ] Keyboard navigable
- [ ] No layout shift on interaction
- [ ] Loading/skeleton state exists if data-dependent
- [ ] Error state exists if fallible
- [ ] Empty state exists if content can be absent

## REMOVE_BEFORE_ADD
- WHEN: Designing any new UI
- DO: Start with minimum elements. Add only when absence creates confusion.
- NEVER: Add decorative borders, dividers, or backgrounds "to fill space."

## NO_VISUAL_NOISE
- WHEN: Reviewing a completed component
- DO: Ask "can I remove this element and the UI still works?" for every element.
- NEVER: Use borders AND background color AND shadow on the same container. Pick one.

## HIERARCHY_THROUGH_SPACE
- DO: Use whitespace as primary separator. 32px between related groups, 64px+ between sections.
- NEVER: Use <hr> or decorative dividers. Use spacing tokens.

## CARD_STANDARD
- DO: border-radius: 12px, padding: 24px, subtle border (1px solid at 6-8% opacity).
- NEVER: Mix border-radius values across cards on the same page.`,

  typography: `# Typography

Applied when working with text rendering, fonts, or typographic hierarchy.

## Type Scale (use exact values)
| Token | Size | Line Height | Weight | Use Case |
|-------|------|-------------|--------|----------|
| display | clamp(36px, 5vw, 64px) | 1.1 | 700 | Hero headlines only |
| h1 | clamp(28px, 4vw, 48px) | 1.15 | 700 | Page titles |
| h2 | clamp(22px, 3vw, 32px) | 1.2 | 600 | Section headings |
| h3 | clamp(18px, 2.5vw, 24px) | 1.3 | 600 | Subsection headings |
| body | 16px | 1.6 | 400 | Default body text |
| body-sm | 14px | 1.5 | 400 | Secondary text |
| caption | 12px | 1.4 | 500 | Metadata, timestamps |

## FLUID_HEADINGS
- DO: Always use clamp() for headings. Format: clamp(min, preferred-vw, max).
- NEVER: Use fixed px values for headings.

## TABULAR_NUMBERS
- WHEN: Displaying numbers that change (counters, timers, prices)
- DO: Apply font-variant-numeric: tabular-nums.
- NEVER: Display changing numbers without tabular-nums.

## TEXT_MAX_WIDTH
- DO: Constrain paragraphs with max-width: 65ch.
- NEVER: Let body text run wider than 75ch.`,

  interactiveElements: `# Interactive Elements

Applied when building buttons, inputs, forms, links, toggles, or any clickable element.

## Universal Rules (ALL interactive elements)
\`\`\`css
.interactive {
  user-select: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: all 150ms ease;
}
\`\`\`

All interactive elements MUST define: Default, Hover, Active/Pressed, Focus-visible, Disabled states.

## BUTTON_SIZES
- sm: height 32px, padding 0 12px, font-size 13px
- md: height 40px, padding 0 16px, font-size 14px
- lg: height 48px, padding 0 24px, font-size 16px
Minimum touch target: 44x44px.

## BUTTON_VARIANTS
- primary: Solid background. ONE per visible screen area.
- secondary: Border/outline only.
- ghost: No background, text-only with hover.
- destructive: Red-toned. Deletions only.

## INPUT_STANDARD
Height 40px, padding 0 12px, border-radius 8px. Font-size 16px (prevents iOS zoom).

## INPUT_FOCUS
Use 2px ring (box-shadow, not border): box-shadow: 0 0 0 2px rgba(primary, 0.5).
NEVER use border changes for focus (causes layout shift).`,

  motion: `# Motion & Animation

Applied when adding transitions, animations, hover effects, or state changes.

## Duration Scale
| Token | Duration | Use Case |
|-------|----------|----------|
| instant | 100ms | Color changes, opacity toggles |
| fast | 150ms | Button presses, hover states |
| normal | 200ms | Dropdowns, tooltips |
| smooth | 300ms | Modals, drawers |
| slow | 500ms | Complex layout shifts |

## Easing
- ease-out: cubic-bezier(0, 0, 0.2, 1) — Elements entering
- ease-in: cubic-bezier(0.4, 0, 1, 1) — Elements exiting
- ease-in-out: cubic-bezier(0.4, 0, 0.2, 1) — Elements transforming

## ENTER_VS_EXIT
- Enter: fade in + scale from 0.95 with ease-out
- Exit: fade out with ease-in, 30% faster than enter
- NEVER: Use same duration for enter and exit.

## NO_LAYOUT_ANIMATION
- DO: Only animate transform and opacity (GPU-composited).
- NEVER: Animate width, height, padding, margin, top, left.

## RESPECT_REDUCED_MOTION
\`\`\`css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
\`\`\``,

  colorSystem: `# Color System

Applied when choosing colors, implementing themes, or building dark mode.

## Semantic Tokens (USE THESE in components)
\`\`\`css
--color-bg-primary, --color-bg-secondary, --color-bg-tertiary
--color-text-primary, --color-text-secondary, --color-text-tertiary
--color-border-default, --color-border-subtle, --color-border-strong
--color-accent, --color-accent-hover, --color-accent-subtle
--color-success, --color-warning, --color-destructive
\`\`\`

## SEMANTIC_NOT_RAW
- DO: Use semantic tokens (--color-text-primary).
- NEVER: Use raw hex (#1a1a1a) or Tailwind literals (text-gray-500) in components.

## DARK_MODE_NOT_INVERSION
- DO: Design dark mode as separate palette. Warm grays (hsl 220, 10%, 10%), not pure black. Text at 85-90% white.
- NEVER: Use #000000 background or #ffffff text on dark.

## CONTRAST_MINIMUMS
- Normal text (<24px): 4.5:1 ratio
- Large text (≥24px): 3:1 ratio
- UI components: 3:1 ratio

## COLOR_FOR_MEANING
- DO: Always pair color with icon or text label.
- NEVER: Rely solely on color (8% of men are colorblind).`,

  layoutSpacing: `# Layout & Spacing

Applied when positioning elements, creating layouts, or defining spacing.

## 4px Grid (use these tokens ONLY)
| Token | Value | Use Case |
|-------|-------|----------|
| xs | 4px | Inline icon gaps |
| sm | 8px | Related element gaps |
| md | 12px | Compact card padding |
| base | 16px | Default padding |
| lg | 20px | Component internal padding |
| xl | 24px | Card padding |
| 2xl | 32px | Between related sections |
| 3xl | 40px | Major section breaks |
| 4xl | 48px | Page section padding |
| 5xl | 64px | Hero sections |

## SPACING_PROXIMITY
- DO: Related items get LESS space. Unrelated items get MORE space. Ratio at least 2:1.
- NEVER: Use same spacing everywhere.

## RESPONSIVE_BREAKPOINTS
- sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
- Mobile-first: base styles for 320px, add min-width queries upward.
- NEVER: Use max-width queries.

## FLEX_VS_GRID
- Flex: one-dimensional (nav bars, button groups)
- Grid: two-dimensional (page structure, card grids)
- NEVER: Use float for layout.

## DEAD_ZONES
- DO: Make ENTIRE row/item clickable, not just text. Zero gaps between interactive items.`,

  accessibility: `# Accessibility

Applied to every component, every page. WCAG 2.1 AA is the minimum standard.

## SEMANTIC_HTML
- DO: Use header, nav, main, section, article, aside, footer. One h1 per page. Never skip heading levels.
- NEVER: Use div for everything.

## FOCUS_MANAGEMENT
- DO: Visible focus with :focus-visible. 2px ring, offset 2px. Tab order follows visual order.
- NEVER: Remove focus outlines without alternative.

## IMAGE_ALT_TEXT
- Informative images: descriptive alt text
- Decorative images: alt=""
- Icons in buttons: button gets aria-label, icon gets aria-hidden="true"

## ICON_BUTTONS
- DO: Add aria-label describing the action.
- NEVER: Create icon-only buttons without aria-label.

## TOUCH_TARGETS
- DO: Minimum 44x44px.
- NEVER: Ship interactive elements smaller than 44x44px on mobile.

## DIALOG_PATTERN
- DO: Use <dialog> or role="dialog" with aria-modal="true". Trap focus. Close on Escape. Return focus on close.`,

  performance: `# Performance

Applied when loading assets, rendering pages, or optimizing UX.

## Core Web Vitals Targets
- LCP: < 2.5s
- INP: < 200ms
- CLS: < 0.1

## IMAGE_OPTIMIZATION
- DO: Use Next.js <Image>. Specify width/height. Use priority only for above-fold LCP images.
- NEVER: Use <img> without dimensions.

## FONT_LOADING
- DO: Use next/font. Preload primary weight. Max 2 families, 3-4 weights total.
- NEVER: Load from Google Fonts CDN directly.

## BUNDLE_SIZE
- DO: Check bundlephobia before adding deps. Dynamic import() for non-critical components. Tree-shake imports.
- NEVER: Import entire libraries for one function.

## LAYOUT_SHIFT_PREVENTION
- DO: Reserve space for images. Use skeletons matching content dimensions.
- NEVER: Render content that pushes other content down after initial paint.

## CODE_SPLITTING
- DO: Use next/dynamic for heavy components. Load modals dynamically.`,

  codeStandards: `# Code Standards

Applied to every file, every function, every component.

## STRICT_MODE
- DO: strict: true in tsconfig. No any. No @ts-ignore.
- NEVER: Use any or disable strict mode.

## ZOD_BOUNDARIES
- WHEN: Data crosses trust boundary (API, form, URL params, env vars)
- DO: Define Zod schema and parse. Use z.infer<typeof schema> for type.
- NEVER: Trust API responses without validation.

## SERVER_FIRST
- DO: Default to Server Component. Add "use client" only for useState, useEffect, event handlers, browser APIs.
- NEVER: Use useEffect for data fetching.

## COMPONENT_STRUCTURE
Order: Types → Component function → Hooks → Derived values → Event handlers → Early returns → JSX

## FILE_NAMING
- Components: PascalCase.tsx
- Hooks: use-kebab-case.ts
- Utilities: kebab-case.ts

## NAMING_CONVENTIONS
- Booleans: is, has, should, can prefix
- Event handlers: handle prefix
- Event props: on prefix
- Async functions: action verb suffix (fetchUsers, createProject)`,

  backendApi: `# Backend & API Patterns

Applied when building server actions, API routes, database queries, or auth flows.

## SERVER_ACTIONS_FIRST
- DO: Use Server Actions for mutations. Server Components for reads.
- NEVER: Create /api/ routes for standard CRUD.

## API_ROUTE_SHAPE
Success: { success: true, data: T }
Error: { success: false, error: { code, message, details? } }
- NEVER: Return 200 with error body.

## VALIDATE_AT_BOUNDARY
- DO: Parse with Zod immediately when data enters. Fail fast.
- NEVER: Validate inside business logic.

## AUTH_PATTERN
- DO: Check auth at TOP of every protected action/route. Check both authentication AND authorization.
- NEVER: Trust client-side auth state for server decisions.

## RATE_LIMITING
- DO: Rate limit auth endpoints, AI/LLM calls, file uploads, search, writes.
- NEVER: Ship AI features without rate limiting.

## WEBHOOK_HANDLING
- DO: Verify signature FIRST. Process idempotently. Return 200 immediately.
- NEVER: Process without signature verification.

## AI_INTEGRATION
- DO: Stream responses. Set max_tokens. Validate AI output with Zod. Implement timeout and retry.
- NEVER: Trust AI output without validation. Never make AI calls without rate limiting.`,

  dataLayer: `# Data Layer

Applied when designing database schemas, managing state, or caching.

## TABLE_NAMING
- DO: Singular PascalCase models (User, Project). snake_case columns. Every table: id (cuid), createdAt, updatedAt.
- NEVER: Use plural table names. Never use auto-increment IDs for user-facing resources.

## RELATION_PATTERNS
- DO: Define both sides of relation. Foreign key as {model}Id. Index every foreign key.
- NEVER: Leave foreign keys unindexed.

## STATE_LOCATION (prefer higher)
1. Server state (Server Components)
2. URL state (search params)
3. Server cache (React Query)
4. Component state (useState)
5. Global client state (Zustand)

## URL_AS_STATE
- WHEN: Building filters, pagination, tabs, search
- DO: Store in URL search params.
- NEVER: Store filterable state in useState.

## CACHE_INVALIDATION
- DO: Use revalidatePath() or revalidateTag() after mutations.
- NEVER: Rely on user refreshing.`,

  copyVoice: `# Copy & Voice

Applied when writing any user-facing text.

Voice: Clear, Confident, Human.

## BUTTON_LABELS
- DO: Verb + noun. "Create project" / "Save changes" / "Delete account"
- NEVER: "Submit" / "OK" / "Confirm" / "Yes"

## ERROR_MESSAGES
Formula: What happened + Why + What to do next.
- DO: "Couldn't save. File too large (max 10MB). Try compressing."
- NEVER: "Error: 413" or "Something went wrong."

## EMPTY_STATES
Show: (1) What would be here, (2) Why empty, (3) How to fill it.
- DO: "No projects yet. Create your first project." + [Create project] button
- NEVER: Blank space with no explanation.

## LOADING_MESSAGES
- DO: Be specific. "Loading your projects..." not "Loading..."
- For AI (3+ seconds): progressive messages every 2-3s.

## SUCCESS_MESSAGES
- DO: Brief and specific. "Project created" / "Changes saved"
- NEVER: Use "successfully" — it's always redundant.

## CONFIRMATION_DIALOGS
- DO: State consequence. "Delete 'Q4 Report'? This can't be undone." Actions: "Cancel" + "Delete report"
- NEVER: "Are you sure?" as title.`,

  testingQa: `# Testing & QA

Applied when writing tests, auditing quality, or preparing for launch.

## WHAT_TO_TEST (2am rule)
ALWAYS test:
- Auth flows (sign up, sign in, password reset)
- Payment/billing logic
- Data mutations affecting multiple records
- Business logic calculations
- API response validation

SKIP: Simple presentational components, third-party wrappers, CSS.

## PRE_LAUNCH_QA Checklist
Functionality:
- [ ] Core user journey start to finish
- [ ] Empty states render
- [ ] Large data paginates
- [ ] Bad data handled
- [ ] Loading/error states work

Cross-device:
- [ ] iPhone Safari, Android Chrome, Desktop Chrome
- [ ] 320px width

Polish:
- [ ] No console errors
- [ ] Favicon and OG image work
- [ ] 404 page exists

## ACCESSIBILITY_AUDIT
1. Automated: axe DevTools
2. Keyboard: Tab through app
3. Screen reader: VoiceOver/NVDA on main flow
4. Zoom: 200% still works
5. Color: Contrast ratios, colorblind simulator`,

  opsShip: `# Ops & Ship

Applied when deploying, managing environments, or monitoring.

## GIT_WORKFLOW
- DO: Trunk-based. Work on main. Short-lived feature branches. Conventional commits.
- NEVER: Work on branch > 2-3 days without merging.

## ENVIRONMENT_MANAGEMENT
- Local: .env.local
- Preview: Vercel preview deployments
- Production: .env vars in Vercel dashboard
- DO: Validate all env vars with Zod at startup. Separate DBs for preview/production.
- NEVER: Share database between preview and production.

## PRE_DEPLOY_CHECKLIST
- [ ] npm run build passes
- [ ] TypeScript zero errors
- [ ] No console.log in production
- [ ] New env vars set in Vercel
- [ ] DB migrations applied
- [ ] Test critical path manually

## ERROR_MONITORING
- DO: Install Sentry before first user. Configure source maps. Set up alerts.
- NEVER: Ship without error monitoring.

## LOGGING_STANDARDS
Levels: error (broke), warn (unexpected but handled), info (business events), debug (troubleshooting)
- DO: Structured JSON logging.
- NEVER: Log sensitive data. No console.log in production.`,

  growthLaunch: `# Growth & Launch

Applied when preparing for launch, analytics, or discovery.

## SEO_FOUNDATIONS
Every page needs: title (50-60 chars), description (120-155 chars), openGraph, twitter cards, sitemap.xml, robots.txt.
- NEVER: Launch without meta tags.

## OG_IMAGE
- DO: 1200x630px for every distinct page type. Use @vercel/og for dynamic.
- NEVER: Ship without OG images.

## ANALYTICS_SETUP
Core events: page_view, sign_up, sign_in, core_action, upgrade_started, upgrade_completed, error_shown
- DO: Define taxonomy BEFORE instrumenting.
- NEVER: Track everything or track PII.

## LANDING_PAGE_STRUCTURE
1. Hero: benefit headline + CTA
2. Social proof
3. Problem (2-3 pain points)
4. Solution (show product)
5. Features (3-4 key capabilities)
6. Proof (testimonials)
7. Pricing
8. Final CTA

## LAUNCH_CHECKLIST
Technical: env vars, DB migrated, Sentry active, analytics, domain/SSL, OG images, sitemap
Content: landing page, terms/privacy, FAQ, welcome email
Launch day: Test signup, post announcement, monitor errors 2hrs, respond to users within 2hrs`,

  projectSetup: `# Project Setup

Applied when scaffolding new projects.

## Initialize
\`\`\`bash
npx create-next-app@latest --typescript --tailwind --eslint --app --src-dir
\`\`\`

## TypeScript Strict
\`\`\`json
{ "compilerOptions": { "strict": true, "noUncheckedIndexedAccess": true } }
\`\`\`

## Core Dependencies
\`\`\`bash
npm install zod clsx tailwind-merge lucide-react
\`\`\`

## Folder Structure
\`\`\`
src/
├── app/           # Next.js App Router
├── components/
│   ├── ui/        # Primitives (Button, Input)
│   └── features/  # Feature-specific
├── lib/
│   ├── utils.ts
│   └── schemas/   # Zod schemas
├── hooks/
└── types/
\`\`\`

## DEPENDENCY_AUDIT
- DO: Check bundlephobia. Prefer >100k weekly downloads. Ask: "Can I build in <50 lines?"
- NEVER: Add dependency for <50 lines of code.

## ENV_VARS
- DO: Validate all with Zod at startup. Prefix client-safe with NEXT_PUBLIC_.
- NEVER: Use process.env directly. Never commit .env files.`,
};

// ============================================
// CREATE HEXES
// ============================================

async function populateConstitution() {
  console.log("Populating Hive with Engineering Constitution...\n");

  // 1. Create the hub junction
  await hive.createHex({
    id: "engineering-constitution",
    name: "Engineering Constitution",
    type: "junction",
    description: "Agent-native routing hub for engineering standards. Query with your current task to get relevant rules.",
    entryHints: [
      "engineering rules",
      "engineering standards",
      "code standards",
      "how to build",
      "best practices",
      "constitution",
      "coding guidelines",
      "development rules",
    ],
    tags: ["constitution", "standards", "hub"],
    contents: {
      data: {
        purpose: "Route agents to specific engineering rule domains based on current task",
        usage: "Query with your task intent. Follow edges to relevant domain hexes.",
        globalRules: constitution.globalRules,
      },
    },
    edges: [
      {
        id: "to-strategy",
        to: "constitution-strategy-scope",
        when: { intent: "new product feature scoping planning MVP requirements" },
        priority: 10,
        description: "Strategy, scoping, MVP definition, ship dates",
      },
      {
        id: "to-design-system",
        to: "constitution-design-system",
        when: { intent: "visual identity tokens colors fonts design system branding" },
        priority: 10,
        description: "Design tokens, fonts, colors, component library choice",
      },
      {
        id: "to-ui-foundations",
        to: "constitution-ui-foundations",
        when: { intent: "component page layout UI interface building" },
        priority: 9,
        description: "Component patterns, restraint, visual hierarchy",
      },
      {
        id: "to-typography",
        to: "constitution-typography",
        when: { intent: "typography text fonts headings type scale" },
        priority: 8,
        description: "Type scale, fluid sizing, font settings",
      },
      {
        id: "to-interactive",
        to: "constitution-interactive-elements",
        when: { intent: "buttons inputs forms links toggles interactive" },
        priority: 9,
        description: "Buttons, inputs, forms, all interactive states",
      },
      {
        id: "to-motion",
        to: "constitution-motion",
        when: { intent: "animation transition motion hover effects" },
        priority: 8,
        description: "Animation timing, easing, enter/exit patterns",
      },
      {
        id: "to-color",
        to: "constitution-color-system",
        when: { intent: "color theme dark mode palette tokens" },
        priority: 8,
        description: "Semantic tokens, dark mode, contrast",
      },
      {
        id: "to-layout",
        to: "constitution-layout-spacing",
        when: { intent: "layout spacing grid responsive breakpoints" },
        priority: 8,
        description: "4px grid, breakpoints, flex/grid patterns",
      },
      {
        id: "to-accessibility",
        to: "constitution-accessibility",
        when: { intent: "accessibility a11y WCAG screen reader keyboard focus" },
        priority: 9,
        description: "WCAG AA, focus management, ARIA, semantic HTML",
      },
      {
        id: "to-performance",
        to: "constitution-performance",
        when: { intent: "performance speed optimization loading bundle" },
        priority: 8,
        description: "Core Web Vitals, images, code splitting",
      },
      {
        id: "to-code-standards",
        to: "constitution-code-standards",
        when: { intent: "code standards TypeScript React naming patterns" },
        priority: 9,
        description: "TypeScript strict, React patterns, file naming",
      },
      {
        id: "to-backend",
        to: "constitution-backend-api",
        when: { intent: "backend API server action auth rate limiting webhook" },
        priority: 9,
        description: "Server actions, API routes, auth, AI integration",
      },
      {
        id: "to-data-layer",
        to: "constitution-data-layer",
        when: { intent: "database schema state management caching data" },
        priority: 8,
        description: "Database schemas, state management, caching",
      },
      {
        id: "to-copy-voice",
        to: "constitution-copy-voice",
        when: { intent: "copy text writing labels errors empty states UX writing" },
        priority: 8,
        description: "Microcopy, error messages, button labels, tone",
      },
      {
        id: "to-testing",
        to: "constitution-testing-qa",
        when: { intent: "testing tests QA quality assurance pre-launch" },
        priority: 8,
        description: "What to test, pre-launch QA, audits",
      },
      {
        id: "to-ops",
        to: "constitution-ops-ship",
        when: { intent: "deployment deploy shipping CI CD monitoring logging" },
        priority: 8,
        description: "Deployment, environments, monitoring, git workflow",
      },
      {
        id: "to-growth",
        to: "constitution-growth-launch",
        when: { intent: "launch SEO analytics landing page growth" },
        priority: 8,
        description: "SEO, analytics, landing pages, launch checklist",
      },
      {
        id: "to-project-setup",
        to: "constitution-project-setup",
        when: { intent: "new project setup scaffolding initialize dependencies" },
        priority: 9,
        description: "Project scaffolding, dependencies, folder structure",
      },
    ],
  });
  console.log("Created: engineering-constitution (hub)");

  // 2. Create domain hexes with conditional cross-domain edges
  const domains = [
    {
      id: "constitution-strategy-scope",
      name: "Strategy & Scope",
      hints: ["strategy", "scope", "MVP", "planning", "requirements", "ship date", "feature scoping"],
      tags: ["strategy", "planning"],
      content: constitution.strategyScope,
      related: [
        { to: "constitution-project-setup", intent: "scaffold setup initialize new project" },
      ],
    },
    {
      id: "constitution-design-system",
      name: "Design System",
      hints: ["design system", "tokens", "fonts", "colors", "visual identity", "branding"],
      tags: ["design", "tokens"],
      content: constitution.designSystem,
      related: [
        { to: "constitution-color-system", intent: "color palette theme dark mode" },
        { to: "constitution-typography", intent: "fonts type scale heading" },
      ],
    },
    {
      id: "constitution-ui-foundations",
      name: "UI Foundations",
      hints: ["UI", "component", "page", "layout", "interface", "checklist"],
      tags: ["ui", "components"],
      content: constitution.uiFoundations,
      related: [
        { to: "constitution-interactive-elements", intent: "button input form interactive" },
        { to: "constitution-layout-spacing", intent: "grid spacing responsive breakpoint" },
      ],
    },
    {
      id: "constitution-typography",
      name: "Typography",
      hints: ["typography", "fonts", "text", "headings", "type scale", "line height"],
      tags: ["typography", "design"],
      content: constitution.typography,
      related: [
        { to: "constitution-design-system", intent: "tokens visual identity branding" },
      ],
    },
    {
      id: "constitution-interactive-elements",
      name: "Interactive Elements",
      hints: ["buttons", "inputs", "forms", "links", "toggles", "interactive", "click", "tap"],
      tags: ["ui", "forms", "interactive"],
      content: constitution.interactiveElements,
      related: [
        { to: "constitution-accessibility", intent: "keyboard focus screen reader ARIA a11y" },
        { to: "constitution-motion", intent: "animation transition hover easing" },
      ],
    },
    {
      id: "constitution-motion",
      name: "Motion & Animation",
      hints: ["animation", "motion", "transition", "hover", "easing", "duration"],
      tags: ["animation", "design"],
      content: constitution.motion,
      related: [
        { to: "constitution-interactive-elements", intent: "button hover press state" },
        { to: "constitution-performance", intent: "optimization gpu transform" },
      ],
    },
    {
      id: "constitution-color-system",
      name: "Color System",
      hints: ["color", "theme", "dark mode", "palette", "tokens", "contrast"],
      tags: ["color", "design", "theming"],
      content: constitution.colorSystem,
      related: [
        { to: "constitution-design-system", intent: "tokens visual identity" },
        { to: "constitution-accessibility", intent: "contrast ratio colorblind" },
      ],
    },
    {
      id: "constitution-layout-spacing",
      name: "Layout & Spacing",
      hints: ["layout", "spacing", "grid", "responsive", "breakpoints", "flex", "gap"],
      tags: ["layout", "spacing", "responsive"],
      content: constitution.layoutSpacing,
      related: [
        { to: "constitution-ui-foundations", intent: "component container card" },
      ],
    },
    {
      id: "constitution-accessibility",
      name: "Accessibility",
      hints: ["accessibility", "a11y", "WCAG", "screen reader", "keyboard", "focus", "ARIA"],
      tags: ["accessibility", "a11y"],
      content: constitution.accessibility,
      related: [
        { to: "constitution-interactive-elements", intent: "button input form focus" },
        { to: "constitution-color-system", intent: "contrast color meaning" },
      ],
    },
    {
      id: "constitution-performance",
      name: "Performance",
      hints: ["performance", "speed", "optimization", "loading", "bundle", "Core Web Vitals", "LCP"],
      tags: ["performance", "optimization"],
      content: constitution.performance,
      related: [
        { to: "constitution-motion", intent: "animation gpu transform" },
      ],
    },
    {
      id: "constitution-code-standards",
      name: "Code Standards",
      hints: ["code standards", "TypeScript", "React", "naming", "patterns", "strict mode"],
      tags: ["code", "typescript", "react"],
      content: constitution.codeStandards,
      related: [
        { to: "constitution-backend-api", intent: "server action api route" },
      ],
    },
    {
      id: "constitution-backend-api",
      name: "Backend & API",
      hints: ["backend", "API", "server action", "auth", "rate limiting", "webhook", "AI integration"],
      tags: ["backend", "api", "auth"],
      content: constitution.backendApi,
      related: [
        { to: "constitution-data-layer", intent: "database schema state caching" },
        { to: "constitution-code-standards", intent: "typescript zod validation patterns" },
      ],
    },
    {
      id: "constitution-data-layer",
      name: "Data Layer",
      hints: ["database", "schema", "state management", "caching", "data", "Prisma", "URL state"],
      tags: ["database", "state", "data"],
      content: constitution.dataLayer,
      related: [
        { to: "constitution-backend-api", intent: "api server action mutation" },
      ],
    },
    {
      id: "constitution-copy-voice",
      name: "Copy & Voice",
      hints: ["copy", "text", "writing", "labels", "errors", "empty states", "UX writing", "microcopy"],
      tags: ["copy", "writing", "ux"],
      content: constitution.copyVoice,
      related: [
        { to: "constitution-interactive-elements", intent: "button label form input" },
      ],
    },
    {
      id: "constitution-testing-qa",
      name: "Testing & QA",
      hints: ["testing", "tests", "QA", "quality assurance", "pre-launch", "checklist"],
      tags: ["testing", "qa"],
      content: constitution.testingQa,
      related: [
        { to: "constitution-accessibility", intent: "audit keyboard screen reader" },
        { to: "constitution-performance", intent: "lighthouse audit vitals" },
      ],
    },
    {
      id: "constitution-ops-ship",
      name: "Ops & Ship",
      hints: ["deployment", "deploy", "shipping", "CI", "CD", "monitoring", "logging", "git"],
      tags: ["ops", "deployment", "devops"],
      content: constitution.opsShip,
      related: [
        { to: "constitution-growth-launch", intent: "launch SEO analytics" },
      ],
    },
    {
      id: "constitution-growth-launch",
      name: "Growth & Launch",
      hints: ["launch", "SEO", "analytics", "landing page", "growth", "OG image", "marketing"],
      tags: ["launch", "growth", "seo"],
      content: constitution.growthLaunch,
      related: [
        { to: "constitution-ops-ship", intent: "deploy production environment" },
      ],
    },
    {
      id: "constitution-project-setup",
      name: "Project Setup",
      hints: ["new project", "setup", "scaffolding", "initialize", "dependencies", "folder structure"],
      tags: ["setup", "scaffolding"],
      content: constitution.projectSetup,
      related: [
        { to: "constitution-code-standards", intent: "typescript react patterns naming" },
        { to: "constitution-strategy-scope", intent: "MVP planning requirements" },
      ],
    },
  ];

  for (const domain of domains) {
    await hive.createHex({
      id: domain.id,
      name: domain.name,
      type: "data",
      description: `Engineering constitution rules for ${domain.name.toLowerCase()}`,
      entryHints: domain.hints,
      tags: ["constitution", ...domain.tags],
      contents: {
        data: {
          rules: domain.content,
        },
      },
      edges: [
        {
          id: "back-to-hub",
          to: "engineering-constitution",
          when: { always: true },
          priority: 1,
          description: "Return to constitution hub for other domains",
        },
        ...domain.related.map((rel, i) => ({
          id: `to-related-${i}`,
          to: rel.to,
          when: { intent: rel.intent },
          priority: 5,
          description: `Related: ${rel.to.replace("constitution-", "")}`,
        })),
      ],
    });
    console.log(`Created: ${domain.id}`);
  }

  console.log("\n✅ Engineering Constitution loaded into Hive!");
  console.log(`   Hub: engineering-constitution`);
  console.log(`   Domains: ${domains.length} hexes`);
  console.log("\nUsage: Query hive with 'engineering constitution' or specific domain like 'UI components rules'");
}

populateConstitution().catch(console.error);
