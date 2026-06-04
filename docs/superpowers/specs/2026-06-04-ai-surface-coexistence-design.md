# Coexisting Help Center & Agents Manager — Design

**Date:** 2026-06-04
**Branch:** `add/ai-surface-coexistence`
**Status:** Approved design — ready for implementation planning

## Background

Today the Help Center and Agents Manager are **mutually exclusive at mount time**. A
single server flag (`unified_ai_chat`, surfaced via `useShouldUseUnifiedAgent()`) decides
which one renders:

- When the flag is **off**, Help Center mounts and the Agents Manager loader returns `null`.
- When the flag is **on**, Agents Manager mounts and Help Center *suppresses its own portal
  entirely* — `packages/help-center/src/components/help-center.tsx` returns `null` and never
  creates its DOM container.
- The masterbar (`client/layout/masterbar/logged-in.jsx`, `renderHelpCenter()`) shows exactly
  **one** icon, branched on the flag.

Because only one surface ever exists on the page, there is no runtime coordination.

Key facts established during exploration:

- Both surfaces already own a `@wordpress/data` store in `@automattic/data-stores`:
  - `automattic/help-center` — `show`, `isMinimized` (both persisted).
  - `automattic/agents-manager` — `isOpen`, `isMinimized`, `isDocked`, `floatingPosition`
    (persisted) and `isSplitScreen` (session-only). Minimized state was recently added in
    PR #111297; the undocked minimized state is the agenttic `minimized` bar.
- **Both widget bundles externalize `@wordpress/data` to the global `window.wp.data`
  registry** (`apps/help-center/webpack.config.js`, `apps/agents-manager/webpack.config.js`
  via `DependencyExtractionWebpackPlugin`; `wp-data` appears in each `*.asset.json`), and both
  register their stores by string key on that one singleton. So a coordinator can
  `select()`/`dispatch()` across both stores in **both** Calypso and widgets.wp.com — no
  cross-bundle messaging is required. The help-center wp-admin entry already checks for both
  `#wp-admin-bar-agents-manager` and `#wp-admin-bar-help-center`, confirming they coexist.
- Both undocked surfaces anchor to the **bottom-right** corner (Help Center: draggable card at
  `right:50px; bottom:50px`, minimized bar docks to `bottom:0`; Agents Manager: FAB + floating
  chat). Only Agents Manager has a **docked/sidebar** mode (fixed right rail, pushes page
  content left, `z-index: 999999`).

## Goal

Load **both** surfaces on the same page and make them aware of each other so that:

1. At most **one** surface is *expanded* at a time when both are floating.
2. Opening one **auto-minimizes** the other (it is never fully dismissed by the act of opening
   the other).
3. Both can sit **minimized together**, their bars **stacked vertically** in the bottom-right.
4. **Agents Manager docked** coexists peacefully with a floating Help Center (no mutual
   exclusion in that case).

This replaces the flag-driven, mount-time mutual exclusion with runtime coordination.

## Non-goals

- No new docking/sidebar capability for Help Center — only Agents Manager docks.
- No merging of the two surfaces into one component or one store (that is Approach C, rejected
  below).
- No change to reader-chat or any other single-surface context's behavior.
- No horizontal or "shared tray" arrangement of minimized bars (Approach B/C in stacking,
  rejected).

## Approaches considered

**Coordination mechanism**

- **A — Subscription coordinator (chosen).** A thin shared hook/module subscribes to both
  stores and enforces the invariant by dispatching the surfaces' *existing* actions. Smallest
  change, reuses existing state, surfaces stay ignorant of each other, trivially flag-gated,
  works identically in Calypso and each widget bundle via the shared registry.
- **B — Cross-store awareness inside each store's actions.** Teach each store's open action to
  minimize the other. No new module, but the invariant is split across two files, each store
  hard-depends on the other's key, and dispatch loops/ordering become a risk. Rejected.
- **C — New shared coordinator store** owning `activeSurface` + stack order, with both surfaces
  deriving visibility from it. Cleanest long-term shape, but a real refactor only justified if
  more AI surfaces are coming. Rejected for now (revisit if a third surface appears).

**Minimized-bar arrangement:** vertical stack (chosen) over horizontal row or shared-tray
container.

**Launchers:** two separate masterbar icons (chosen) over a single icon with in-surface switch
or a chooser menu.

## Design

### 1. The coordinator

A new `useAiSurfaceCoordinator()` hook (a small shared module; lives alongside the stores in
`@automattic/data-stores` or a dedicated small package, decided at planning time), mounted
**once per environment**: in the Calypso layout, and in each widget app entry that can host both
surfaces. It:

- Subscribes to `automattic/help-center` (`show`, `isMinimized`) and
  `automattic/agents-manager` (`isOpen`, `isMinimized`, `isDocked`) on the shared
  `window.wp.data` registry.
- Enforces the invariant by dispatching the **existing** actions only —
  `setShowHelpCenter`/`showHelpCenter`/`setIsMinimized` (help-center) and
  `setIsOpen`/`setIsMinimized` (agents-manager). No new visibility logic is added inside the
  surface components.
- **No-ops gracefully when only one surface is present.** If the other store is not registered
  (e.g. reader-chat public frontends, or a page that enqueues only one widget), the coordinator
  does nothing, leaving single-surface behavior exactly as today.
- Owns a small **persisted "last expanded surface"** marker used for boot reconciliation.
- Guards against dispatch loops: a transition only fires when it actually changes state, and the
  coordinator must not react to a minimize it just caused.

### 2. Behavior rules

- **Floating + floating:** when one surface becomes expanded (via its masterbar icon, or by
  un-minimizing its bar), the coordinator sets the other to `isMinimized: true`.
- **Docked AM + Help Center:** coexist. No mutual exclusion. Any floating Help Center element —
  open card *or* minimized bar — offsets left by the sidebar width so it never overlaps the
  rail. There is **no** "minimize-on-dock" action: to dock, Agents Manager must be open, which
  (by the floating rule) means Help Center is already minimized or closed at that moment.
- **Boot reconciliation:** if persisted state has *both* surfaces expanded, the coordinator
  expands the **most-recently-active** surface (from the persisted marker) and minimizes the
  other.

#### Behavior matrix

| Situation | Result |
|---|---|
| HC open, click Agents icon | AM expands; HC → minimized bar (stacked) |
| AM open (floating), click Help icon | HC expands; AM → minimized bar (stacked) |
| Both minimized | Two bars, vertical stack, bottom-right |
| AM docked + open HC | Coexist — HC floats, offset left of the rail |
| Dock AM | HC already minimized/closed (AM was open) → no action |
| Reload, both were expanded | Most-recently-active expands; other minimizes |

### 3. Stacking

- Vertical stack in the bottom-right; the **most-recently-active** bar sits on the **bottom**
  (nearest the corner), the other above it.
- The coordinator assigns each *visible minimized* bar a slot index. Each bar computes its
  bottom offset from the heights of the bars below it (Help Center's bar is ~56px;
  Agents Manager uses the agenttic `minimized` bar). The mechanism for handing the slot/offset
  to each bar (a shared CSS custom property vs. a prop/state read) is decided at planning time;
  the constraint is that it must work across the two separate portals the bars render into.
- When Agents Manager is docked, the same stack applies but shifted left of the rail.
- **Mobile:** still at most one expanded (full-width bottom sheet); minimized bars use the same
  vertical stack at the bottom edge.

### 4. Launchers

Two masterbar / admin-bar icons — a Help (`?`) icon and an Agents/AI (`✨`) icon — each toggling
its own surface. This replaces the single-icon, flag-branched `renderHelpCenter()` in
`client/layout/masterbar/logged-in.jsx`. Clicking one while the other is expanded triggers the
auto-minimize rule via the coordinator.

### 5. Gating and rollout

The coexistence behavior is gated behind a feature flag so it can ship dark and ramp:

- **Flag on:** both loaders (`client/layout/help-center-loader.tsx`,
  `client/layout/agents-manager-loader.tsx`) mount; `help-center.tsx` stops self-suppressing;
  the masterbar renders both icons; the coordinator runs.
- **Flag off:** today's exact behavior is preserved (mount-time mutual exclusion, single icon).

The relationship between the new flag and the existing `unified_ai_chat` flag is resolved at
planning time (new flag layered on top vs. repurposing the existing one).

### 6. Components touched (indicative)

- New: `useAiSurfaceCoordinator()` + its persisted "last expanded surface" marker.
- `packages/help-center/src/components/help-center.tsx` — stop self-suppressing under the flag.
- `packages/help-center` container/scss — offset-left positioning when AM is docked; stack slot.
- `packages/agents-manager` — expose/consume stack slot for its minimized bar; offset-left math
  is moot for the docked rail but relevant to its minimized bar's position.
- `client/layout/help-center-loader.tsx`, `client/layout/agents-manager-loader.tsx` — both mount
  under the flag.
- `client/layout/masterbar/logged-in.jsx` — render both icons under the flag.
- Widget entries in `apps/help-center` and `apps/agents-manager` — mount the coordinator.

## Testing

- **Coordinator unit tests:** every transition in the behavior matrix; no dispatch loops;
  single-surface no-op; boot reconciliation (both-expanded → most-recently-active wins);
  docked-AM coexistence (opening HC does not minimize a docked AM).
- **Component tests:** the two minimized bars receive correct stack slot / offset; Help Center
  offsets left when AM is docked.
- **Manual matrix:** run the full behavior matrix in both Calypso and a wp-admin page that
  enqueues both widgets, desktop and mobile.

## Open items for planning

- Exact home of the coordinator module and the "last expanded surface" marker (which store /
  persistence backend).
- Slot/offset hand-off mechanism across the two portals (CSS custom property vs. state).
- New flag vs. repurposing `unified_ai_chat`.
