# Help Center / Agents Manager Coexistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Help Center and Agents Manager load together and coordinate at runtime so only one is expanded at a time, the other parks as a minimized bar, the two minimized bars stack, and a docked Agents Manager coexists with a floating Help Center — all behind a feature flag, replacing today's mount-time mutual exclusion.

**Architecture:** A pure reconciler (`computeCoordination`) plus a thin React hook (`useAiSurfaceCoordinator`) live in `@automattic/data-stores`. The hook subscribes to both existing `@wordpress/data` stores on the shared `window.wp.data` registry, enforces "at most one floating-expanded" by dispatching the surfaces' *existing* `setIsMinimized` actions, persists a "last expanded" marker in `localStorage`, and writes layout CSS custom properties on `:root` (stack offsets + docked rail inset) that each surface's SCSS consumes (defaulting to today's values when unset). A new gating hook `useShouldCoexistAiSurfaces()` mirrors the existing `useShouldUseUnifiedAgent()` and turns the whole behavior on/off.

**Tech Stack:** TypeScript, `@wordpress/data`, `@wordpress/element`, React, Jest + `@testing-library`, SCSS.

**Out of scope (cross-repo dependency — track separately):** The Jetpack `jetpack-mu-wpcom` backend must (a) expose the new `ai_surface_coexistence` flag via the same `/agents-manager/state` mechanism + inline `agentsManagerData`, and (b) stop dequeuing Help Center scripts on Gutenberg pages when the flag is on. Without (a) the flag is always `false` (safe no-op); without (b) the widgets.wp.com Gutenberg path won't load both. The Calypso SPA path is fully exercisable without Jetpack changes by forcing the flag in dev (see Task 6).

---

## File Structure

- **Create** `packages/data-stores/src/ai-surface-coordinator/reconciler.ts` — pure state machine + types. No React, no `@wordpress/data`.
- **Create** `packages/data-stores/src/ai-surface-coordinator/reconciler.test.ts` — unit tests for the reconciler.
- **Create** `packages/data-stores/src/ai-surface-coordinator/constants.ts` — bar height/gap, CSS var names, localStorage key.
- **Create** `packages/data-stores/src/ai-surface-coordinator/layout.ts` — pure function computing `:root` CSS-var values from observed state.
- **Create** `packages/data-stores/src/ai-surface-coordinator/layout.test.ts` — unit tests for layout var computation.
- **Create** `packages/data-stores/src/ai-surface-coordinator/index.ts` — `useAiSurfaceCoordinator()` hook wiring reconciler+layout to the live stores + DOM, plus barrel exports.
- **Modify** `packages/data-stores/src/index.ts` — export the coordinator module.
- **Create** `packages/agents-manager/src/hooks/use-should-coexist-ai-surfaces.ts` — gating hook (mirrors `use-should-use-unified-agent.ts`).
- **Modify** `packages/agents-manager/src/hooks/use-unified-ai-chat.ts` — read the new `ai_surface_coexistence` state key alongside `unified_ai_chat`.
- **Modify** `packages/agents-manager/src/index.ts` — export the new gating hook.
- **Modify** `packages/help-center/src/components/help-center.tsx` — stop self-suppressing when coexistence is on; mount the coordinator.
- **Modify** `packages/help-center/src/styles.scss` — consume stack/rail CSS vars on the minimized/desktop card.
- **Modify** `packages/agents-manager/src/components/agent-dock/style.scss` — consume the stack CSS var on the undocked minimized bar.
- **Modify** `client/layout/help-center-loader.tsx` — mount Help Center when coexistence is on.
- **Modify** `client/layout/agents-manager-loader.tsx` — mount Agents Manager when coexistence is on.
- **Modify** `client/layout/masterbar/logged-in.jsx` — render both masterbar icons when coexistence is on.
- **Modify** `apps/help-center/help-center-wp-admin.jsx` and `apps/agents-manager/agents-manager-with-provider.jsx` — mount the coordinator in each widget entry.

---

## Task 1: Reconciler types and "no conflict" base case

**Files:**
- Create: `packages/data-stores/src/ai-surface-coordinator/reconciler.ts`
- Test: `packages/data-stores/src/ai-surface-coordinator/reconciler.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// reconciler.test.ts
import { computeCoordination, type SurfaceSnapshot } from './reconciler';

const HC_CLOSED = { present: true, shown: false, minimized: false };
const AM_CLOSED = { present: true, open: false, minimized: false, docked: false };

function snap( hc: Partial< SurfaceSnapshot[ 'helpCenter' ] >, am: Partial< SurfaceSnapshot[ 'agentsManager' ] > ): SurfaceSnapshot {
	return { helpCenter: { ...HC_CLOSED, ...hc }, agentsManager: { ...AM_CLOSED, ...am } };
}

describe( 'computeCoordination — no conflict', () => {
	it( 'returns no commands when neither surface is expanded', () => {
		const prev = snap( {}, {} );
		const next = snap( {}, {} );
		expect( computeCoordination( prev, next, null ) ).toEqual( { commands: [], lastExpanded: null } );
	} );

	it( 'records the sole expanded floating surface as lastExpanded without minimizing anything', () => {
		const prev = snap( {}, {} );
		const next = snap( { shown: true }, {} );
		expect( computeCoordination( prev, next, null ) ).toEqual( { commands: [], lastExpanded: 'help-center' } );
	} );

	it( 'treats a docked Agents Manager as non-conflicting with an expanded Help Center', () => {
		const prev = snap( { shown: true }, {} );
		const next = snap( { shown: true }, { open: true, docked: true } );
		expect( computeCoordination( prev, next, 'help-center' ) ).toEqual( { commands: [], lastExpanded: 'help-center' } );
	} );

	it( 'no-ops entirely when a surface is not present', () => {
		const prev = snap( { shown: true }, {} );
		const next = snap( { shown: true }, { present: false, open: true } );
		expect( computeCoordination( prev, next, 'help-center' ).commands ).toEqual( [] );
	} );
} );
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest packages/data-stores/src/ai-surface-coordinator/reconciler.test.ts`
Expected: FAIL — `Cannot find module './reconciler'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// reconciler.ts
export type Surface = 'help-center' | 'agents-manager';

export interface SurfaceSnapshot {
	helpCenter: { present: boolean; shown: boolean; minimized: boolean };
	agentsManager: { present: boolean; open: boolean; minimized: boolean; docked: boolean };
}

export type Command =
	| { type: 'minimize'; surface: 'help-center' }
	| { type: 'minimize'; surface: 'agents-manager' };

export interface CoordinationResult {
	commands: Command[];
	lastExpanded: Surface | null;
}

const isHelpCenterExpanded = ( s: SurfaceSnapshot ) =>
	s.helpCenter.present && s.helpCenter.shown && ! s.helpCenter.minimized;

// A docked Agents Manager lives in its own rail and never conflicts.
const isAgentsManagerFloatingExpanded = ( s: SurfaceSnapshot ) =>
	s.agentsManager.present &&
	s.agentsManager.open &&
	! s.agentsManager.minimized &&
	! s.agentsManager.docked;

export function computeCoordination(
	prev: SurfaceSnapshot,
	next: SurfaceSnapshot,
	lastExpanded: Surface | null
): CoordinationResult {
	const hcExpanded = isHelpCenterExpanded( next );
	const amExpanded = isAgentsManagerFloatingExpanded( next );

	// Single (or zero) floating-expanded surface: record it, nothing to minimize.
	if ( ! ( hcExpanded && amExpanded ) ) {
		const sole = hcExpanded ? 'help-center' : amExpanded ? 'agents-manager' : lastExpanded;
		return { commands: [], lastExpanded: sole };
	}

	// Conflict resolution lands in Task 2.
	return { commands: [], lastExpanded };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn jest packages/data-stores/src/ai-surface-coordinator/reconciler.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/data-stores/src/ai-surface-coordinator/reconciler.ts packages/data-stores/src/ai-surface-coordinator/reconciler.test.ts
git commit -m "Add AI surface coordinator reconciler — no-conflict base case"
```

---

## Task 2: Reconciler conflict resolution (minimize the loser)

**Files:**
- Modify: `packages/data-stores/src/ai-surface-coordinator/reconciler.ts`
- Test: `packages/data-stores/src/ai-surface-coordinator/reconciler.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
describe( 'computeCoordination — conflict resolution', () => {
	it( 'minimizes the previously-open surface when the other newly expands (open HC over open AM)', () => {
		const prev = snap( {}, { open: true } );           // AM floating-open, HC closed
		const next = snap( { shown: true }, { open: true } ); // user just opened HC
		const result = computeCoordination( prev, next, 'agents-manager' );
		expect( result.commands ).toEqual( [ { type: 'minimize', surface: 'agents-manager' } ] );
		expect( result.lastExpanded ).toBe( 'help-center' );
	} );

	it( 'minimizes Help Center when Agents Manager newly expands over an open Help Center', () => {
		const prev = snap( { shown: true }, {} );
		const next = snap( { shown: true }, { open: true } );
		const result = computeCoordination( prev, next, 'help-center' );
		expect( result.commands ).toEqual( [ { type: 'minimize', surface: 'help-center' } ] );
		expect( result.lastExpanded ).toBe( 'agents-manager' );
	} );

	it( 'on boot (both already expanded, no transition) keeps the lastExpanded surface', () => {
		const both = snap( { shown: true }, { open: true } );
		const result = computeCoordination( both, both, 'help-center' );
		expect( result.commands ).toEqual( [ { type: 'minimize', surface: 'agents-manager' } ] );
		expect( result.lastExpanded ).toBe( 'help-center' );
	} );

	it( 'on boot with no marker, defaults to keeping Agents Manager (minimizes Help Center)', () => {
		const both = snap( { shown: true }, { open: true } );
		const result = computeCoordination( both, both, null );
		expect( result.commands ).toEqual( [ { type: 'minimize', surface: 'help-center' } ] );
		expect( result.lastExpanded ).toBe( 'agents-manager' );
	} );
} );
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest packages/data-stores/src/ai-surface-coordinator/reconciler.test.ts`
Expected: FAIL — conflict cases return `{ commands: [] }`.

- [ ] **Step 3: Replace the conflict branch in `reconciler.ts`**

Replace the `// Conflict resolution lands in Task 2.` block and its `return` with:

```ts
	// Both floating-expanded → keep one, minimize the other.
	// Prefer the surface that just transitioned into expansion this tick.
	const hcJustExpanded = hcExpanded && ! isHelpCenterExpanded( prev );
	const amJustExpanded = amExpanded && ! isAgentsManagerFloatingExpanded( prev );

	let keep: Surface;
	if ( hcJustExpanded && ! amJustExpanded ) {
		keep = 'help-center';
	} else if ( amJustExpanded && ! hcJustExpanded ) {
		keep = 'agents-manager';
	} else {
		// No single transition (e.g. boot from persisted state, or both at once):
		// keep the most-recently-active; default to Agents Manager when unknown.
		keep = lastExpanded ?? 'agents-manager';
	}

	const loser: Surface = keep === 'help-center' ? 'agents-manager' : 'help-center';
	return { commands: [ { type: 'minimize', surface: loser } ], lastExpanded: keep };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn jest packages/data-stores/src/ai-surface-coordinator/reconciler.test.ts`
Expected: PASS (8 tests total).

- [ ] **Step 5: Commit**

```bash
git add packages/data-stores/src/ai-surface-coordinator/reconciler.ts packages/data-stores/src/ai-surface-coordinator/reconciler.test.ts
git commit -m "Add AI surface coordinator conflict resolution"
```

---

## Task 3: Coordinator constants

**Files:**
- Create: `packages/data-stores/src/ai-surface-coordinator/constants.ts`

- [ ] **Step 1: Write the file (no test — plain constants)**

```ts
// constants.ts
// Height of each surface's minimized bar, in px. Help Center's bar is
// $head-foot-height (56px); Agents Manager's agenttic minimized bar matches.
export const MINIMIZED_BAR_HEIGHT = 56;
// Vertical gap between stacked minimized bars, in px.
export const STACK_GAP = 8;

// Persisted (localStorage) marker for boot tie-break. Not server-backed: it is
// a non-critical UI hint, so it avoids a backend allowed-key change.
export const LAST_EXPANDED_STORAGE_KEY = 'ai-surface-last-expanded';

// CSS custom properties written on :root and consumed by each surface's SCSS.
// Each defaults (when unset) to the surface's pre-coexistence value.
export const CSS_VAR_HC_STACK_BOTTOM = '--ai-surface-hc-stack-bottom';
export const CSS_VAR_AM_STACK_BOTTOM = '--ai-surface-am-stack-bottom';
export const CSS_VAR_RAIL_INSET = '--ai-surface-rail-inset';
```

- [ ] **Step 2: Commit**

```bash
git add packages/data-stores/src/ai-surface-coordinator/constants.ts
git commit -m "Add AI surface coordinator constants"
```

---

## Task 4: Layout CSS-variable computation

**Files:**
- Create: `packages/data-stores/src/ai-surface-coordinator/layout.ts`
- Test: `packages/data-stores/src/ai-surface-coordinator/layout.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// layout.test.ts
import { computeLayoutVars } from './layout';
import type { SurfaceSnapshot, Surface } from './reconciler';

const HC_CLOSED = { present: true, shown: false, minimized: false };
const AM_CLOSED = { present: true, open: false, minimized: false, docked: false };
function snap( hc = {}, am = {} ): SurfaceSnapshot {
	return { helpCenter: { ...HC_CLOSED, ...hc }, agentsManager: { ...AM_CLOSED, ...am } };
}

describe( 'computeLayoutVars', () => {
	it( 'leaves both stack bottoms at 0 when only one bar is minimized', () => {
		const vars = computeLayoutVars( snap( { shown: true, minimized: true } ), null );
		expect( vars[ '--ai-surface-hc-stack-bottom' ] ).toBe( '0px' );
		expect( vars[ '--ai-surface-am-stack-bottom' ] ).toBe( '0px' );
	} );

	it( 'raises the non-most-recent bar by (barHeight + gap) when both are minimized', () => {
		const both = snap( { shown: true, minimized: true }, { open: true, minimized: true } );
		const vars = computeLayoutVars( both, 'help-center' as Surface );
		// HC most recent → bottom slot; AM raised above it.
		expect( vars[ '--ai-surface-hc-stack-bottom' ] ).toBe( '0px' );
		expect( vars[ '--ai-surface-am-stack-bottom' ] ).toBe( '64px' );
	} );

	it( 'sets the rail inset to the sidebar width when Agents Manager is docked', () => {
		const vars = computeLayoutVars( snap( {}, { open: true, docked: true } ), null );
		expect( vars[ '--ai-surface-rail-inset' ] ).toBe( 'var(--am-sidebar-width, 350px)' );
	} );

	it( 'sets the rail inset to 0 when Agents Manager is not docked', () => {
		const vars = computeLayoutVars( snap( {}, {} ), null );
		expect( vars[ '--ai-surface-rail-inset' ] ).toBe( '0px' );
	} );
} );
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest packages/data-stores/src/ai-surface-coordinator/layout.test.ts`
Expected: FAIL — `Cannot find module './layout'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// layout.ts
import {
	MINIMIZED_BAR_HEIGHT,
	STACK_GAP,
	CSS_VAR_HC_STACK_BOTTOM,
	CSS_VAR_AM_STACK_BOTTOM,
	CSS_VAR_RAIL_INSET,
} from './constants';
import type { Surface, SurfaceSnapshot } from './reconciler';

export type LayoutVars = Record< string, string >;

const hcBarVisible = ( s: SurfaceSnapshot ) =>
	s.helpCenter.present && s.helpCenter.shown && s.helpCenter.minimized;

const amBarVisible = ( s: SurfaceSnapshot ) =>
	s.agentsManager.present &&
	s.agentsManager.open &&
	s.agentsManager.minimized &&
	! s.agentsManager.docked;

export function computeLayoutVars( s: SurfaceSnapshot, lastExpanded: Surface | null ): LayoutVars {
	const raised = `${ MINIMIZED_BAR_HEIGHT + STACK_GAP }px`;
	const bothMinimized = hcBarVisible( s ) && amBarVisible( s );

	let hcBottom = '0px';
	let amBottom = '0px';
	if ( bothMinimized ) {
		// Most-recently-active bar sits on the bottom (slot 0); the other is raised.
		const amOnBottom = lastExpanded === 'agents-manager';
		hcBottom = amOnBottom ? raised : '0px';
		amBottom = amOnBottom ? '0px' : raised;
	}

	return {
		[ CSS_VAR_HC_STACK_BOTTOM ]: hcBottom,
		[ CSS_VAR_AM_STACK_BOTTOM ]: amBottom,
		[ CSS_VAR_RAIL_INSET ]: s.agentsManager.docked
			? 'var(--am-sidebar-width, 350px)'
			: '0px',
	};
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn jest packages/data-stores/src/ai-surface-coordinator/layout.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/data-stores/src/ai-surface-coordinator/layout.ts packages/data-stores/src/ai-surface-coordinator/layout.test.ts
git commit -m "Add AI surface coordinator layout var computation"
```

---

## Task 5: The `useAiSurfaceCoordinator` hook

**Files:**
- Create: `packages/data-stores/src/ai-surface-coordinator/index.ts`
- Modify: `packages/data-stores/src/index.ts`
- Test: `packages/data-stores/src/ai-surface-coordinator/index.test.tsx`

Confirm `@wordpress/data` and `@wordpress/element` are already dependencies of `packages/data-stores/package.json` (they are — used throughout the store modules). No dependency change expected.

- [ ] **Step 1: Write the failing test**

```tsx
// index.test.tsx
import { dispatch, register, createReduxStore } from '@wordpress/data';
import { renderHook } from '@testing-library/react';
import { useAiSurfaceCoordinator } from './index';
import { STORE_KEY as HC_KEY } from '../help-center/constants';
import { STORE_KEY as AM_KEY } from '../agents-manager/constants';

// Minimal stand-in stores keyed exactly like the real ones.
function registerStubStores() {
	register( createReduxStore( HC_KEY, {
		reducer: ( state = { showHelpCenter: false, isMinimized: false }, action ) =>
			action.type === 'SET' ? { ...state, ...action.payload } : state,
		actions: {
			set: ( payload ) => ( { type: 'SET', payload } ),
			setIsMinimized: ( isMinimized ) => ( { type: 'SET', payload: { isMinimized } } ),
		},
		selectors: {
			isHelpCenterShown: ( s ) => s.showHelpCenter,
			getIsMinimized: ( s ) => s.isMinimized,
		},
	} ) );
	register( createReduxStore( AM_KEY, {
		reducer: ( state = { isOpen: false, isMinimized: false, isDocked: false }, action ) =>
			action.type === 'SET' ? { ...state, ...action.payload } : state,
		actions: {
			set: ( payload ) => ( { type: 'SET', payload } ),
			setIsMinimized: ( isMinimized ) => ( { type: 'SET', payload: { isMinimized } } ),
		},
		selectors: {
			getIsOpen: ( s ) => s.isOpen,
			getIsMinimized: ( s ) => s.isMinimized,
			getIsDocked: ( s ) => s.isDocked,
		},
	} ) );
}

beforeEach( () => {
	window.localStorage.clear();
	registerStubStores();
} );

it( 'minimizes Agents Manager when Help Center opens while AM is floating-open', () => {
	dispatch( AM_KEY ).set( { isOpen: true } );
	renderHook( () => useAiSurfaceCoordinator( true ) );
	dispatch( HC_KEY ).set( { showHelpCenter: true } );
	// The coordinator should have dispatched setIsMinimized(true) on AM.
	const { select } = require( '@wordpress/data' );
	expect( select( AM_KEY ).getIsMinimized() ).toBe( true );
} );

it( 'no-ops when disabled', () => {
	dispatch( AM_KEY ).set( { isOpen: true } );
	renderHook( () => useAiSurfaceCoordinator( false ) );
	dispatch( HC_KEY ).set( { showHelpCenter: true } );
	const { select } = require( '@wordpress/data' );
	expect( select( AM_KEY ).getIsMinimized() ).toBe( false );
} );
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest packages/data-stores/src/ai-surface-coordinator/index.test.tsx`
Expected: FAIL — `Cannot find module './index'` (or no export `useAiSurfaceCoordinator`).

- [ ] **Step 3: Write the hook**

```ts
// index.ts
import { select, dispatch, subscribe } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { STORE_KEY as AM_KEY } from '../agents-manager/constants';
import { STORE_KEY as HC_KEY } from '../help-center/constants';
import { LAST_EXPANDED_STORAGE_KEY } from './constants';
import { computeLayoutVars } from './layout';
import { computeCoordination, type Surface, type SurfaceSnapshot } from './reconciler';

export * from './reconciler';
export * from './layout';
export * from './constants';

function readSnapshot(): SurfaceSnapshot {
	const hc = select( HC_KEY ) as
		| { isHelpCenterShown: () => boolean; getIsMinimized: () => boolean }
		| undefined;
	const am = select( AM_KEY ) as
		| { getIsOpen: () => boolean; getIsMinimized: () => boolean; getIsDocked: () => boolean }
		| undefined;

	return {
		helpCenter: {
			present: !! hc,
			shown: !! hc?.isHelpCenterShown(),
			minimized: !! hc?.getIsMinimized(),
		},
		agentsManager: {
			present: !! am,
			open: !! am?.getIsOpen(),
			minimized: !! am?.getIsMinimized(),
			docked: !! am?.getIsDocked(),
		},
	};
}

function readLastExpanded(): Surface | null {
	const v = window.localStorage.getItem( LAST_EXPANDED_STORAGE_KEY );
	return v === 'help-center' || v === 'agents-manager' ? v : null;
}

function writeLastExpanded( surface: Surface | null ) {
	if ( surface ) {
		window.localStorage.setItem( LAST_EXPANDED_STORAGE_KEY, surface );
	}
}

function applyLayoutVars( vars: Record< string, string > ) {
	const root = document.documentElement;
	for ( const [ name, value ] of Object.entries( vars ) ) {
		root.style.setProperty( name, value );
	}
}

/**
 * Runtime coordinator that keeps at most one AI surface floating-expanded.
 * Mount once per page (Calypso layout, each widget entry). Pass `enabled=false`
 * to fully disable (flag off) — it then performs no subscription and no writes.
 */
export function useAiSurfaceCoordinator( enabled: boolean ) {
	useEffect( () => {
		if ( ! enabled ) {
			return;
		}

		let prev = readSnapshot();
		let lastExpanded = readLastExpanded();

		const reconcile = () => {
			const next = readSnapshot();
			const { commands, lastExpanded: nextLast } = computeCoordination( prev, next, lastExpanded );

			if ( nextLast !== lastExpanded ) {
				lastExpanded = nextLast;
				writeLastExpanded( lastExpanded );
			}

			for ( const command of commands ) {
				if ( command.surface === 'agents-manager' ) {
					( dispatch( AM_KEY ) as { setIsMinimized: ( v: boolean ) => void } ).setIsMinimized( true );
				} else {
					( dispatch( HC_KEY ) as { setIsMinimized: ( v: boolean ) => void } ).setIsMinimized( true );
				}
			}

			applyLayoutVars( computeLayoutVars( next, lastExpanded ) );
			prev = next;
		};

		reconcile(); // boot reconciliation
		const unsubscribe = subscribe( reconcile );
		return unsubscribe;
	}, [ enabled ] );
}
```

- [ ] **Step 4: Export from the package barrel**

In `packages/data-stores/src/index.ts`, add alongside the other `export * as` lines:

```ts
export * as AiSurfaceCoordinator from './ai-surface-coordinator';
```

- [ ] **Step 5: Run test to verify it passes**

Run: `yarn jest packages/data-stores/src/ai-surface-coordinator/index.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Typecheck the package**

Run: `yarn typecheck-packages` (or `yarn tsc -p packages/data-stores`)
Expected: no new errors in `ai-surface-coordinator/`.

- [ ] **Step 7: Commit**

```bash
git add packages/data-stores/src/ai-surface-coordinator/index.ts packages/data-stores/src/ai-surface-coordinator/index.test.tsx packages/data-stores/src/index.ts
git commit -m "Add useAiSurfaceCoordinator hook"
```

---

## Task 6: Gating hook `useShouldCoexistAiSurfaces`

**Files:**
- Modify: `packages/agents-manager/src/hooks/use-unified-ai-chat.ts`
- Create: `packages/agents-manager/src/hooks/use-should-coexist-ai-surfaces.ts`
- Modify: `packages/agents-manager/src/index.ts`

The flag rides the exact same mechanism as `unified_ai_chat`: an inline `agentsManagerData` value on wp-admin, and the `/agents-manager/state` endpoint on Calypso. Backend exposure is the tracked Jetpack dependency; until it lands the value is `undefined` → `false` (safe).

- [ ] **Step 1: Extend the state response + fetch the new key**

In `use-unified-ai-chat.ts`, change the response interface and add a second query for the coexistence flag. Append after `useUnifiedAiChat`:

```ts
interface CoexistenceStateResponse {
	ai_surface_coexistence?: boolean;
}

/**
 * Determines whether Help Center and Agents Manager should coexist (both
 * loaded, runtime-coordinated) instead of being mutually exclusive.
 * Mirrors useUnifiedAiChat's hybrid inline/endpoint approach.
 */
export function useAiSurfaceCoexistence( enabled = true ) {
	return useQuery< boolean, Error >( {
		queryKey: [ 'ai-surface-coexistence' ],
		queryFn: async () => {
			if ( canAccessWpcomApis() ) {
				const response: CoexistenceStateResponse = await wpcomRequest( {
					path: '/agents-manager/state?key=ai_surface_coexistence',
					apiNamespace: 'wpcom/v2',
				} );
				return response.ai_surface_coexistence ?? false;
			}
			return false;
		},
		enabled,
		refetchOnWindowFocus: false,
		staleTime: 300000,
	} );
}
```

- [ ] **Step 2: Create the gating hook**

```ts
// use-should-coexist-ai-surfaces.ts
/* eslint-disable no-restricted-imports */
import { useAiSurfaceCoexistence } from './use-unified-ai-chat';

export const useShouldCoexistAiSurfaces = () => {
	const { data } = useAiSurfaceCoexistence();
	return !! data;
};
```

- [ ] **Step 3: Export it**

In `packages/agents-manager/src/index.ts`, add next to the existing `useShouldUseUnifiedAgent` export:

```ts
export { useShouldCoexistAiSurfaces } from './hooks/use-should-coexist-ai-surfaces';
```

- [ ] **Step 4: Verify it builds + typechecks**

Run: `yarn tsc -p packages/agents-manager` (or `yarn typecheck-packages`)
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add packages/agents-manager/src/hooks/use-unified-ai-chat.ts packages/agents-manager/src/hooks/use-should-coexist-ai-surfaces.ts packages/agents-manager/src/index.ts
git commit -m "Add ai_surface_coexistence gating hook"
```

---

## Task 7: Help Center stops self-suppressing under the flag + mounts coordinator

**Files:**
- Modify: `packages/help-center/src/components/help-center.tsx`

- [ ] **Step 1: Update the suppression logic**

In `help-center.tsx`:

1. Add imports near the other external deps:

```ts
import { useShouldCoexistAiSurfaces } from '@automattic/agents-manager';
import { AiSurfaceCoordinator } from '@automattic/data-stores';
```

2. Inside `HelpCenter`, after `const shouldUseUnifiedAgent = useShouldUseUnifiedAgent();` add:

```ts
	const shouldCoexist = useShouldCoexistAiSurfaces();
	// When coexisting, Help Center must render even though the unified agent is on.
	const suppress = shouldUseUnifiedAgent && ! shouldCoexist;
	AiSurfaceCoordinator.useAiSurfaceCoordinator( shouldCoexist );
```

3. Replace the portal-creation guard `if ( ! shouldUseUnifiedAgent ) {` with `if ( ! suppress ) {`.

4. Replace the early return `if ( ! container || shouldUseUnifiedAgent ) {` with `if ( ! container || suppress ) {`.

- [ ] **Step 2: Run related tests**

Run: `yarn jest packages/help-center/src/components`
Expected: PASS (no regression; existing suppression behavior holds when `shouldCoexist` is false — the default in tests).

- [ ] **Step 3: Typecheck**

Run: `yarn tsc -p packages/help-center`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add packages/help-center/src/components/help-center.tsx
git commit -m "Render Help Center alongside Agents Manager when coexistence is on"
```

---

## Task 8: Calypso loaders mount both surfaces under the flag

**Files:**
- Modify: `client/layout/agents-manager-loader.tsx`
- Modify: `client/layout/help-center-loader.tsx`

- [ ] **Step 1: Agents Manager loader — mount when unified OR coexistence is on**

In `agents-manager-loader.tsx`:

1. Add import: `import { useShouldUseUnifiedAgent, useShouldCoexistAiSurfaces } from '@automattic/agents-manager';` (extend the existing import).
2. Add `const shouldCoexist = useShouldCoexistAiSurfaces();`.
3. Change the guard from:

```ts
	if ( ! shouldUseUnifiedAgent || ! loadAgentsManager ) {
		return null;
	}
```

to:

```ts
	if ( ( ! shouldUseUnifiedAgent && ! shouldCoexist ) || ! loadAgentsManager ) {
		return null;
	}
```

- [ ] **Step 2: Help Center loader — already mounts; no gate change needed**

`help-center-loader.tsx` already mounts whenever `loadHelpCenter` is true; suppression happens inside the component (Task 7). No change required here. Confirm by reading lines 44-46 — the only gate is `if ( ! loadHelpCenter ) return null;`.

- [ ] **Step 3: Typecheck client**

Run: `yarn typecheck-client`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add client/layout/agents-manager-loader.tsx
git commit -m "Mount Agents Manager when AI surface coexistence is on"
```

---

## Task 9: Masterbar renders both launchers under the flag

**Files:**
- Modify: `client/layout/masterbar/logged-in.jsx`

Read `renderHelpCenter()` (around lines 806-852) and the `useUnifiedAgent` preference read (line ~939) before editing.

- [ ] **Step 1: Thread a coexistence flag into the masterbar**

The masterbar reads `useUnifiedAgent` from the Redux preference `unified_ai_chat`. Add a sibling read of the `ai_surface_coexistence` preference (populated by the same agents-manager state fetch that already populates `unified_ai_chat`):

```js
const coexistAiSurfaces = getPreference( state, 'ai_surface_coexistence' ) ?? false;
```

Pass it to the component as a prop (mirror exactly how `useUnifiedAgent` is passed).

- [ ] **Step 2: Render both icons when coexisting**

In `renderHelpCenter()`, change the branch so that when `coexistAiSurfaces` is true it returns **both** the `MasterbarAgentsManager` and `MasterbarHelpCenter` async components (each in its own masterbar item), instead of the either/or. Keep the existing `useUnifiedAgent ? AgentsManager : HelpCenter` branch as the `else` (flag-off path):

```jsx
if ( coexistAiSurfaces ) {
	return (
		<>
			{ /* existing MasterbarHelpCenter element */ }
			{ /* existing MasterbarAgentsManager element */ }
		</>
	);
}
// ...existing single-icon branch unchanged...
```

(Reuse the exact AsyncLoad blocks already present for each — do not duplicate their props by hand; lift each into a local `const helpIcon = (...)` / `const agentsIcon = (...)` and reference them in both branches to stay DRY.)

- [ ] **Step 3: Typecheck client + lint the file**

Run: `yarn typecheck-client && yarn eslint client/layout/masterbar/logged-in.jsx`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add client/layout/masterbar/logged-in.jsx
git commit -m "Render both Help Center and Agents Manager masterbar icons when coexisting"
```

---

## Task 10: SCSS consumes the layout CSS variables

**Files:**
- Modify: `packages/help-center/src/styles.scss`
- Modify: `packages/agents-manager/src/components/agent-dock/style.scss`

Each rule adds the new var with a fallback equal to the current value, so flag-off rendering is byte-for-byte unchanged (the vars are simply never set when the coordinator is disabled).

- [ ] **Step 1: Help Center desktop card — offset for the rail and the stack**

In `styles.scss`, find the desktop `.help-center.is-desktop` positioning (`right: 50px; bottom: 50px;` around line 98-126). Change the offsets to incorporate the vars:

```scss
// was: right: 50px;
inset-inline-end: calc( 50px + var( --ai-surface-rail-inset, 0px ) );
```

In the minimized desktop rule (`is-minimized` collapsing to `bottom: 0`), change:

```scss
// was: bottom: 0;
bottom: var( --ai-surface-hc-stack-bottom, 0px );
inset-inline-end: calc( 50px + var( --ai-surface-rail-inset, 0px ) );
```

- [ ] **Step 2: Agents Manager undocked minimized bar — stack offset**

In `agent-dock/style.scss`, find the undocked floating rule (`.agents-manager-chat--undocked ...` around line 703-705). Add a bottom offset driven by the var for the minimized bar:

```scss
.agents-manager-chat--undocked .agenttic.Chat-module_container.Chat-module_floating {
	z-index: 9999;
	bottom: var( --ai-surface-am-stack-bottom, 0px );
}
```

(If the agenttic floating container already sets its own `bottom`, add the var as an additive offset via `margin-block-end: var( --ai-surface-am-stack-bottom, 0px );` instead — verify which by inspecting the rendered element in Task 11.)

- [ ] **Step 3: Lint styles**

Run: `yarn stylelint packages/help-center/src/styles.scss packages/agents-manager/src/components/agent-dock/style.scss`
Expected: no new errors. (Note: client SCSS forbids hardcoded colors and BEM shortcuts; these packages have their own conventions — match the surrounding file. `50px`/`0px` literals are pre-existing here.)

- [ ] **Step 4: Commit**

```bash
git add packages/help-center/src/styles.scss packages/agents-manager/src/components/agent-dock/style.scss
git commit -m "Position minimized AI surfaces via coordinator CSS variables"
```

---

## Task 11: Mount the coordinator in the widget entries + manual verification

**Files:**
- Modify: `apps/agents-manager/agents-manager-with-provider.jsx`
- Modify: `apps/help-center/help-center-wp-admin.jsx`

The Calypso path already mounts the coordinator via Task 7 (inside the Help Center component). The widget bundles load the two surfaces independently, so mount the coordinator once where each app sets up its tree. Mounting it in both is safe — the hook is idempotent and converges — but to avoid double subscription prefer mounting it in the **Agents Manager** widget only (it is the surface always present in the unified experience), and rely on Task 7's mount for the Calypso SPA.

- [ ] **Step 1: Mount in the Agents Manager widget provider**

Read `apps/agents-manager/agents-manager-with-provider.jsx`. At the top of its root component, add:

```jsx
import { useShouldCoexistAiSurfaces } from '@automattic/agents-manager';
import { AiSurfaceCoordinator } from '@automattic/data-stores';
// ...inside the component body:
AiSurfaceCoordinator.useAiSurfaceCoordinator( useShouldCoexistAiSurfaces() );
```

- [ ] **Step 2: Build the widget bundles**

Run: `cd apps/agents-manager && yarn build` (or `yarn dev --sync` when sandboxing `widgets.wp.com`).
Expected: build succeeds; no type errors.

- [ ] **Step 3: Manual verification — Calypso (flag forced on)**

Until the Jetpack backend exposes the flag, force it in dev by stubbing the query. Run `yarn start`, then in the browser console set the React Query cache or temporarily hard-code `useAiSurfaceCoexistence`'s `queryFn` to return `true`. Verify the behavior matrix from the spec:
- Open Help Center, click the Agents icon → AM expands, HC drops to a stacked bar.
- Re-open HC from its bar → HC expands, AM drops to a stacked bar.
- Minimize both → two bars stacked bottom-right, most-recently-active on the bottom.
- Dock AM, then open HC → both visible, HC card offset left of the rail.
- Reload with both having been expanded → most-recently-active wins.

Expected: matches the matrix. Capture before/after screenshots.

- [ ] **Step 4: Commit**

```bash
git add apps/agents-manager/agents-manager-with-provider.jsx
git commit -m "Mount AI surface coordinator in the Agents Manager widget"
```

---

## Task 12: Full type-check + test sweep before PR

- [ ] **Step 1: Run the checks CI will run**

```bash
yarn typecheck-client
yarn typecheck-packages
yarn jest packages/data-stores/src/ai-surface-coordinator
yarn jest packages/help-center
yarn jest -c test/packages/jest.config.js --testPathPattern=agents-manager
```

Expected: all green. Fix any failures at the source (no `as any` / `@ts-ignore`).

- [ ] **Step 2: Commit any fixes, then open a draft PR**

Follow `.github/PULL_REQUEST_TEMPLATE.md`. Include testing instructions for **both** Calypso (`yarn start`) and Simple/Atomic/CIAB (sandbox `widgets.wp.com`, `cd apps/agents-manager && yarn dev --sync`). Reference Linear IDs, not URLs. Note the Jetpack backend dependency (flag exposure + Gutenberg dequeue removal) as a blocker for the widget Gutenberg path.

---

## Cross-repo dependency (tracked separately, not in this plan)

In `jetpack-mu-wpcom/src/features/agents-manager/` (Jetpack monorepo):
1. Expose `ai_surface_coexistence` through the same path that serves `unified_ai_chat`: the `/agents-manager/state` endpoint and the inline `agentsManagerData`. Gate it behind whatever rollout filter mirrors `agents_manager_use_unified_experience`.
2. Stop dequeuing Help Center scripts on Gutenberg pages when `ai_surface_coexistence` is on (see the "Help Center dequeue" pitfall in `packages/agents-manager/AGENTS.md`).

Until (1) ships, the flag resolves to `false` everywhere and behavior is exactly as today.

---

## Self-Review

**Spec coverage:**
- Coordinator (Approach A), shared registry → Tasks 1-5 (reconciler/layout/hook).
- "At most one floating-expanded; opening one minimizes the other" → Tasks 1-2, verified Task 11.
- Graceful no-op when one surface absent → Task 1 (present flag) + Task 5 (`!! select(KEY)`).
- Boot reconciliation, most-recently-active wins → Task 2 + Task 5 (localStorage marker).
- Docked AM coexists; HC offsets left of rail → reconciler `docked` exclusion (Task 1), `--ai-surface-rail-inset` (Tasks 4, 10).
- Vertical stack, most-recent on bottom → Task 4 + Task 10.
- Two masterbar launchers → Task 9.
- Flag gating / rollout (flag on = coexist, off = today) → Task 6 (hook), Tasks 7-9 (gated mounts/branches).
- Reader-chat / single-surface unaffected → no-op behavior (Tasks 1, 5).
- Testing (coordinator state machine, stack slots, manual matrix) → Tasks 1-5 unit tests, Task 11 manual.

**Placeholder scan:** Tasks 9 and 10 reference "the existing MasterbarHelpCenter element" and "if the agenttic container sets its own bottom" — these are deliberate reads-of-existing-code with a concrete decision attached (lift into a const; switch to `margin-block-end`), not TBDs, because the exact surrounding JSX/CSS must be read in-place. All new modules (Tasks 1-6) contain complete code.

**Type consistency:** `SurfaceSnapshot`, `Surface`, `Command`, `CoordinationResult` are defined in Task 1 and used unchanged in Tasks 2, 4, 5. `computeCoordination`/`computeLayoutVars`/`useAiSurfaceCoordinator` names are stable across tasks. CSS var names come from the single `constants.ts` (Task 3) and are reused in Tasks 4, 5, 10. Store keys are imported from each store's existing `constants.ts`.
