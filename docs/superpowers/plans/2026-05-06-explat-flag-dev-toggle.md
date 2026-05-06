# ExPlat Flag Dev Toggle — Phase 0 (SDK Hooks) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a stable `window.__EXPLAT__` debug surface to `@automattic/explat-client` so engineers can override any feature-flag value live in the browser console (or via URL param), with `useFeatureValue` re-rendering automatically and zero pollution of experiment data.

**Architecture:** Override mechanism lives entirely in the SDK package (mirrors GrowthBook's `devtoolsPlugin`). `getFeatureValue` resolves a forced-features map *before* fetching/evaluating; an in-memory subscribe registry powers React re-renders; an evaluation-log ring buffer surfaces what happened for each call. The host wrapper (`client/lib/explat/`) seeds overrides from `?_explat_force=…` and cookie. No UI panel is in this plan — that's Phase 1, layered on top of these hooks. Any value can be forced (intentional, supports testing impossible states); a `getKnownVariations(flagKey)` helper lets a future dropdown UI suggest the experiment's defined variation values.

**Tech Stack:** TypeScript, Jest, `@automattic/explat-client` package (subset of wp-calypso monorepo), React (host wrapper only).

**Base branch:** stacks on `explat-demo-my-dashboard` (PR #110518). Rebase before starting if upstream advanced. The first commit in this branch should land on top of `4486efe7009 feat: wire host helpers and demo flag swap in sidebar`.

**Safety invariants — never violate:**
1. A forced flag value MUST NOT trigger a `POST /assignments/log` beacon. The single integration test in Task 4 guards this.
2. The `window.__EXPLAT__` surface must only attach when `config.isDevelopmentMode === true` OR `runtime.mode === 'manual_testing'`. In default production user sessions, `window.__EXPLAT__` must remain `undefined`.
3. Overrides persisted in `localStorage` must be schema-versioned. A corrupt or wrong-schema entry must be ignored (and removed), not crash the SDK.

---

## File Structure

NEW (SDK):
- `packages/explat-client/src/internal/forced-features.ts` — override map + `localStorage` persistence + subscribe registry
- `packages/explat-client/src/internal/eval-log.ts` — bounded ring buffer of recent `getFeatureValue` evaluations
- `packages/explat-client/src/internal/devtools-window.ts` — installs `window.__EXPLAT__` surface, gated
- `packages/explat-client/src/internal/test/forced-features.test.ts`
- `packages/explat-client/src/internal/test/eval-log.test.ts`
- `packages/explat-client/src/internal/test/devtools-window.test.ts`

MODIFIED (SDK):
- `packages/explat-client/src/create-explat-client.ts` — thread overrides into `getFeatureValue`, expose `subscribe`/`getKnownFlags`/`getKnownVariations` on the client, install devtools surface
- `packages/explat-client/src/test/create-explat-client-feature-value.test.ts` — add override path, beacon-suppression, log-entry, and subscribe tests (file may exist under a different name; reuse the existing `getFeatureValue` test file)

NEW (host):
- `client/lib/explat/internals/dev-overrides-bootstrap.ts` — reads `?_explat_force=<json>` from URL and `_explat_force` cookie, calls `setForcedFeatures` once at boot

MODIFIED (host):
- `client/lib/explat/index.ts` — call dev-overrides bootstrap; `useFeatureValue` subscribes to override changes; re-export the dev surface helpers

---

## Task 1: Forced-features module (override map + persistence + subscribe)

**Files:**
- Create: `packages/explat-client/src/internal/forced-features.ts`
- Test: `packages/explat-client/src/internal/test/forced-features.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/explat-client/src/internal/test/forced-features.test.ts
import { createForcedFeatures } from '../forced-features';

describe( 'createForcedFeatures', () => {
	beforeEach( () => {
		localStorage.clear();
	} );

	it( 'returns undefined for keys with no override', () => {
		const ff = createForcedFeatures();
		expect( ff.get( 'unknown' ) ).toBeUndefined();
		expect( ff.has( 'unknown' ) ).toBe( false );
	} );

	it( 'set / get / has / clear roundtrip', () => {
		const ff = createForcedFeatures();
		ff.set( 'flag_a', 'treatment' );
		ff.set( 'flag_b', true );
		expect( ff.get( 'flag_a' ) ).toBe( 'treatment' );
		expect( ff.get( 'flag_b' ) ).toBe( true );
		expect( ff.has( 'flag_a' ) ).toBe( true );
		ff.clear( 'flag_a' );
		expect( ff.has( 'flag_a' ) ).toBe( false );
		expect( ff.has( 'flag_b' ) ).toBe( true );
		ff.clearAll();
		expect( ff.has( 'flag_b' ) ).toBe( false );
	} );

	it( 'allows any FeatureValue, including values not in the experiment', () => {
		const ff = createForcedFeatures();
		ff.set( 'flag', 'an_unknown_variation_string' );
		ff.set( 'flag_obj', { a: 1, b: [ 2, 3 ] } );
		expect( ff.get( 'flag' ) ).toBe( 'an_unknown_variation_string' );
		expect( ff.get( 'flag_obj' ) ).toEqual( { a: 1, b: [ 2, 3 ] } );
	} );

	it( 'persists overrides to localStorage', () => {
		const ff = createForcedFeatures();
		ff.set( 'flag', 'treatment' );
		expect( localStorage.getItem( 'explat-forced-features-v1' ) ).toContain( 'treatment' );
		const ff2 = createForcedFeatures();
		expect( ff2.get( 'flag' ) ).toBe( 'treatment' );
	} );

	it( 'ignores corrupt or wrong-schema localStorage payloads without throwing', () => {
		localStorage.setItem( 'explat-forced-features-v1', '{not json' );
		expect( () => createForcedFeatures() ).not.toThrow();
		localStorage.setItem(
			'explat-forced-features-v1',
			JSON.stringify( { schema_version: 999, overrides: { x: 1 } } )
		);
		const ff = createForcedFeatures();
		expect( ff.has( 'x' ) ).toBe( false );
	} );

	it( 'notifies subscribers on every mutation', () => {
		const ff = createForcedFeatures();
		const events: Array< { key: string | null } > = [];
		ff.subscribe( ( e ) => events.push( e ) );
		ff.set( 'a', 1 );
		ff.set( 'b', 2 );
		ff.clear( 'a' );
		ff.clearAll();
		expect( events.map( ( e ) => e.key ) ).toEqual( [ 'a', 'b', 'a', null ] );
	} );

	it( 'unsubscribe stops further notifications', () => {
		const ff = createForcedFeatures();
		const calls: number[] = [];
		const unsubscribe = ff.subscribe( () => calls.push( 1 ) );
		ff.set( 'a', 1 );
		unsubscribe();
		ff.set( 'b', 2 );
		expect( calls.length ).toBe( 1 );
	} );

	it( 'snapshot() returns an immutable copy of current overrides', () => {
		const ff = createForcedFeatures();
		ff.set( 'a', 1 );
		const snap = ff.snapshot();
		ff.set( 'b', 2 );
		expect( snap ).toEqual( { a: 1 } ); // unchanged after later mutation
	} );
} );
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn jest packages/explat-client/src/internal/test/forced-features.test.ts`
Expected: FAIL — `Cannot find module '../forced-features'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// packages/explat-client/src/internal/forced-features.ts
import type { FeatureValue } from '../sdk/types';

const STORAGE_KEY = 'explat-forced-features-v1';
const SCHEMA_VERSION = 1;

export type ForcedFeaturesEvent = {
	/** The flag key that changed, or `null` for a `clearAll()` event. */
	key: string | null;
};

export type ForcedFeaturesListener = ( event: ForcedFeaturesEvent ) => void;

export interface ForcedFeatures {
	get: ( flagKey: string ) => FeatureValue | undefined;
	has: ( flagKey: string ) => boolean;
	set: ( flagKey: string, value: FeatureValue ) => void;
	clear: ( flagKey: string ) => void;
	clearAll: () => void;
	snapshot: () => Record< string, FeatureValue >;
	subscribe: ( listener: ForcedFeaturesListener ) => () => void;
}

type StoredShape = {
	schema_version: number;
	overrides: Record< string, FeatureValue >;
};

function readPersisted(): Record< string, FeatureValue > {
	if ( typeof localStorage === 'undefined' ) {
		return {};
	}
	const raw = localStorage.getItem( STORAGE_KEY );
	if ( ! raw ) {
		return {};
	}
	try {
		const parsed = JSON.parse( raw ) as StoredShape;
		if ( ! parsed || parsed.schema_version !== SCHEMA_VERSION ) {
			localStorage.removeItem( STORAGE_KEY );
			return {};
		}
		return parsed.overrides && typeof parsed.overrides === 'object' ? parsed.overrides : {};
	} catch {
		localStorage.removeItem( STORAGE_KEY );
		return {};
	}
}

function writePersisted( overrides: Record< string, FeatureValue > ): void {
	if ( typeof localStorage === 'undefined' ) {
		return;
	}
	try {
		const body: StoredShape = { schema_version: SCHEMA_VERSION, overrides };
		localStorage.setItem( STORAGE_KEY, JSON.stringify( body ) );
	} catch {
		// quota / privacy mode — overrides remain in-memory only
	}
}

export function createForcedFeatures(): ForcedFeatures {
	const overrides: Record< string, FeatureValue > = readPersisted();
	const listeners = new Set< ForcedFeaturesListener >();

	const notify = ( event: ForcedFeaturesEvent ) => {
		for ( const l of listeners ) {
			try {
				l( event );
			} catch {
				// listener errors must not break callers
			}
		}
	};

	return {
		get: ( flagKey ) => ( flagKey in overrides ? overrides[ flagKey ] : undefined ),
		has: ( flagKey ) => flagKey in overrides,
		set: ( flagKey, value ) => {
			overrides[ flagKey ] = value;
			writePersisted( overrides );
			notify( { key: flagKey } );
		},
		clear: ( flagKey ) => {
			if ( ! ( flagKey in overrides ) ) {
				return;
			}
			delete overrides[ flagKey ];
			writePersisted( overrides );
			notify( { key: flagKey } );
		},
		clearAll: () => {
			for ( const k of Object.keys( overrides ) ) {
				delete overrides[ k ];
			}
			writePersisted( overrides );
			notify( { key: null } );
		},
		snapshot: () => ( { ...overrides } ),
		subscribe: ( listener ) => {
			listeners.add( listener );
			return () => {
				listeners.delete( listener );
			};
		},
	};
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn jest packages/explat-client/src/internal/test/forced-features.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/explat-client/src/internal/forced-features.ts \
        packages/explat-client/src/internal/test/forced-features.test.ts
git commit -m "feat(explat): add forced-features override store with localStorage + subscribe"
```

---

## Task 2: Evaluation log ring buffer

**Files:**
- Create: `packages/explat-client/src/internal/eval-log.ts`
- Test: `packages/explat-client/src/internal/test/eval-log.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/explat-client/src/internal/test/eval-log.test.ts
import { createEvalLog } from '../eval-log';

describe( 'createEvalLog', () => {
	it( 'records entries in insertion order', () => {
		const log = createEvalLog( 100 );
		log.record( {
			flag_key: 'a',
			value: 'control',
			source: 'default',
			timestamp: 1,
			attributes: {},
		} );
		log.record( {
			flag_key: 'b',
			value: true,
			source: 'override',
			timestamp: 2,
			attributes: { wpcom_user_id: '1' },
		} );
		expect( log.entries() ).toHaveLength( 2 );
		expect( log.entries()[ 0 ].flag_key ).toBe( 'a' );
		expect( log.entries()[ 1 ].source ).toBe( 'override' );
	} );

	it( 'caps at the configured size, dropping oldest', () => {
		const log = createEvalLog( 3 );
		for ( let i = 0; i < 5; i++ ) {
			log.record( {
				flag_key: `f${ i }`,
				value: i,
				source: 'default',
				timestamp: i,
				attributes: {},
			} );
		}
		const entries = log.entries();
		expect( entries.map( ( e ) => e.flag_key ) ).toEqual( [ 'f2', 'f3', 'f4' ] );
	} );

	it( 'clear() empties the buffer', () => {
		const log = createEvalLog( 10 );
		log.record( {
			flag_key: 'a',
			value: 1,
			source: 'default',
			timestamp: 1,
			attributes: {},
		} );
		log.clear();
		expect( log.entries() ).toEqual( [] );
	} );

	it( 'entries() returns a copy, not a live reference', () => {
		const log = createEvalLog( 10 );
		log.record( {
			flag_key: 'a',
			value: 1,
			source: 'default',
			timestamp: 1,
			attributes: {},
		} );
		const snap = log.entries();
		log.record( {
			flag_key: 'b',
			value: 2,
			source: 'default',
			timestamp: 2,
			attributes: {},
		} );
		expect( snap ).toHaveLength( 1 );
	} );
} );
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn jest packages/explat-client/src/internal/test/eval-log.test.ts`
Expected: FAIL — `Cannot find module '../eval-log'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// packages/explat-client/src/internal/eval-log.ts
import type { FeatureValue } from '../sdk/types';

export type EvalSource = 'override' | 'force' | 'experiment' | 'default' | 'fallback';

export type EvalLogEntry = {
	flag_key: string;
	value: FeatureValue;
	source: EvalSource;
	timestamp: number;
	attributes: Record< string, string >;
};

export interface EvalLog {
	record: ( entry: EvalLogEntry ) => void;
	entries: () => EvalLogEntry[];
	clear: () => void;
}

export function createEvalLog( capacity: number ): EvalLog {
	const buffer: EvalLogEntry[] = [];
	return {
		record: ( entry ) => {
			buffer.push( entry );
			if ( buffer.length > capacity ) {
				buffer.splice( 0, buffer.length - capacity );
			}
		},
		entries: () => buffer.slice(),
		clear: () => {
			buffer.length = 0;
		},
	};
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn jest packages/explat-client/src/internal/test/eval-log.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/explat-client/src/internal/eval-log.ts \
        packages/explat-client/src/internal/test/eval-log.test.ts
git commit -m "feat(explat): add bounded eval log ring buffer"
```

---

## Task 3: Wire override into `getFeatureValue` (override branch + log emission)

**Files:**
- Modify: `packages/explat-client/src/create-explat-client.ts`
- Test: `packages/explat-client/src/test/get-feature-value.test.ts` (or whichever test file currently covers `getFeatureValue` — locate via `grep -rl "getFeatureValue" packages/explat-client/src/test/`)

- [ ] **Step 1: Write failing tests for override branch + log emission**

Add the following describe block to the existing `getFeatureValue` test file. Do NOT replace existing tests.

```ts
describe( 'getFeatureValue forced overrides', () => {
	it( 'returns the forced value before fetching the flag payload', async () => {
		const fetchFlagPayload = jest.fn();
		const logFeatureAssignment = jest.fn();
		const client = createExPlatClient( {
			fetchExperimentAssignment: jest.fn(),
			getAnonId: async () => 'anon-1',
			logError: jest.fn(),
			isDevelopmentMode: true,
			fetchFlagPayload,
			logFeatureAssignment,
			getAttributes: async () => ( {} ),
		} );
		client.devtools.forcedFeatures.set( 'my_flag', 'forced_value' );
		const v = await client.getFeatureValue( 'my_flag', 'control' );
		expect( v ).toBe( 'forced_value' );
		expect( fetchFlagPayload ).not.toHaveBeenCalled();
	} );

	it( 'allows forcing a value not present in the experiment definition', async () => {
		const client = makeMinimalClientForOverrideTests();
		client.devtools.forcedFeatures.set( 'my_flag', 'never_defined_in_experiment' );
		const v = await client.getFeatureValue( 'my_flag', 'control' );
		expect( v ).toBe( 'never_defined_in_experiment' );
	} );

	it( 'does NOT POST a feature-assignment beacon for forced values', async () => {
		const logFeatureAssignment = jest.fn();
		const client = makeMinimalClientForOverrideTests( { logFeatureAssignment } );
		client.devtools.forcedFeatures.set( 'my_flag', 'treatment' );
		await client.getFeatureValue( 'my_flag', 'control' );
		expect( logFeatureAssignment ).not.toHaveBeenCalled();
	} );

	it( 'records an entry in the eval log with source="override"', async () => {
		const client = makeMinimalClientForOverrideTests();
		client.devtools.forcedFeatures.set( 'my_flag', 'treatment' );
		await client.getFeatureValue( 'my_flag', 'control' );
		const log = client.devtools.evalLog.entries();
		expect( log[ log.length - 1 ] ).toMatchObject( {
			flag_key: 'my_flag',
			value: 'treatment',
			source: 'override',
		} );
	} );

	it( 'clearing the override re-evaluates against the payload on next call', async () => {
		const client = makeMinimalClientForOverrideTests();
		client.devtools.forcedFeatures.set( 'my_flag', 'treatment' );
		const v1 = await client.getFeatureValue( 'my_flag', 'control' );
		expect( v1 ).toBe( 'treatment' );
		client.devtools.forcedFeatures.clear( 'my_flag' );
		const v2 = await client.getFeatureValue( 'my_flag', 'control' );
		expect( v2 ).toBe( 'control' ); // falls through to default since flag is unknown
	} );
} );

// Helper — define once at top of describe.
function makeMinimalClientForOverrideTests(
	overrides: Partial< Parameters< typeof createExPlatClient >[ 0 ] > = {}
) {
	return createExPlatClient( {
		fetchExperimentAssignment: jest.fn(),
		getAnonId: async () => 'anon-1',
		logError: jest.fn(),
		isDevelopmentMode: true,
		fetchFlagPayload: async () => ( { schema_version: 1, flags: {}, ttl: 60 } ),
		logFeatureAssignment: jest.fn(),
		getAttributes: async () => ( {} ),
		...overrides,
	} );
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn jest packages/explat-client/src/test/get-feature-value.test.ts`
Expected: FAIL — `client.devtools` is undefined.

- [ ] **Step 3: Modify `create-explat-client.ts` — add devtools surface and override path**

In `packages/explat-client/src/create-explat-client.ts`:

(a) Add imports near the top:

```ts
import { createForcedFeatures, type ForcedFeatures } from './internal/forced-features';
import { createEvalLog, type EvalLog } from './internal/eval-log';
```

(b) Extend the `ExPlatClient` interface so `devtools` is exposed:

```ts
export interface ExPlatClient {
	// ...existing members unchanged...

	/**
	 * Dev/manual-testing surface. Stable contract:
	 *  - `forcedFeatures` — set/clear overrides applied before any fetch/eval
	 *  - `evalLog` — last N evaluations of getFeatureValue
	 * Always present on the client object regardless of mode; the
	 * `window.__EXPLAT__` global that exposes this externally is gated separately.
	 */
	devtools: {
		forcedFeatures: ForcedFeatures;
		evalLog: EvalLog;
	};
}
```

(c) Inside `createExPlatClient`, before the `return { ... }`:

```ts
const forcedFeatures = createForcedFeatures();
const evalLog = createEvalLog( 200 );
```

(d) Replace the body of `getFeatureValue` (the existing one starting around `getFeatureValue: async < T extends FeatureValue >(`) so the override branch runs first:

```ts
getFeatureValue: async < T extends FeatureValue >(
	flagKey: string,
	defaultValue: T
): Promise< WidenPrimitives< T > > => {
	const fallback = defaultValue as unknown as WidenPrimitives< T >;
	const localAttributesForLog = async () => {
		try {
			return ( await config.getAttributes?.() ) ?? {};
		} catch {
			return {};
		}
	};

	// Override branch — always runs first, even if host hasn't wired
	// fetchFlagPayload/getAttributes yet. No fetch, no beacon.
	if ( forcedFeatures.has( flagKey ) ) {
		const value = forcedFeatures.get( flagKey ) as WidenPrimitives< T >;
		evalLog.record( {
			flag_key: flagKey,
			value: value as FeatureValue,
			source: 'override',
			timestamp: Date.now(),
			attributes: await localAttributesForLog(),
		} );
		return value;
	}

	try {
		if ( ! config.fetchFlagPayload || ! config.getAttributes ) {
			evalLog.record( {
				flag_key: flagKey,
				value: defaultValue,
				source: 'fallback',
				timestamp: Date.now(),
				attributes: {},
			} );
			return fallback;
		}

		const runtime = getExPlatRuntime();
		if ( ! runtime.can_evaluate ) {
			evalLog.record( {
				flag_key: flagKey,
				value: defaultValue,
				source: 'fallback',
				timestamp: Date.now(),
				attributes: runtime.attributes,
			} );
			return fallback;
		}

		const payload = await loadFlagPayload(
			config.fetchFlagPayload,
			flagPayloadCache,
			safeLogError
		);
		if ( ! payload ) {
			evalLog.record( {
				flag_key: flagKey,
				value: defaultValue,
				source: 'fallback',
				timestamp: Date.now(),
				attributes: runtime.attributes,
			} );
			return fallback;
		}

		const feature = payload.flags[ flagKey ];
		if ( ! feature ) {
			evalLog.record( {
				flag_key: flagKey,
				value: defaultValue,
				source: 'fallback',
				timestamp: Date.now(),
				attributes: runtime.attributes,
			} );
			return fallback;
		}

		const localAttributes = await config.getAttributes();
		const attributes = {
			...localAttributes,
			...runtime.attributes,
		} as Attributes;

		const result = evalFeature( feature, attributes );

		evalLog.record( {
			flag_key: flagKey,
			value: result.value,
			source: result.source,
			timestamp: Date.now(),
			attributes: localAttributes,
		} );

		if (
			result.source === 'experiment' &&
			runtime.mode === 'normal' &&
			runtime.can_log_assignment &&
			runtime.can_create_assignment
		) {
			void fireFeatureAssignmentBeacon( {
				flag_key: flagKey,
				experiment_id: result.experiment_id,
				experiment_variation_id: result.experiment_variation_id,
				hash_attribute: result.hash_attribute,
				hash_value: result.hash_value,
			} );
		}

		return result.value as WidenPrimitives< T >;
	} catch ( error ) {
		safeLogError( {
			message: ( error as Error ).message,
			flag_key: flagKey,
			source: 'getFeatureValue-error',
		} );
		return fallback;
	}
},
```

(e) Add `devtools: { forcedFeatures, evalLog }` to BOTH the live client return object AND the SSR-safe dummy in `createSsrSafeDummyExPlatClient` (the dummy can use the same `createForcedFeatures()` / `createEvalLog( 0 )` so the shape matches but does nothing meaningful).

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn jest packages/explat-client/`
Expected: PASS — including the previously passing `getFeatureValue` tests AND the new override branch tests (5 new). If any previously passing test now fails, the change broke an invariant — fix the implementation, not the test.

- [ ] **Step 5: Commit**

```bash
git add packages/explat-client/src/create-explat-client.ts \
        packages/explat-client/src/test/get-feature-value.test.ts
git commit -m "feat(explat): wire forced-features into getFeatureValue with eval logging"
```

---

## Task 4: Beacon-suppression integration test (highest-blast-radius invariant)

This is a single, dedicated test that locks in the "no beacon for forced values" invariant. Separate from Task 3 because it's the one a future refactor most needs to keep green.

**Files:**
- Test: same `getFeatureValue` test file as Task 3.

- [ ] **Step 1: Add the test**

```ts
it( 'INVARIANT: no /assignments/log beacon ever fires when a forced override resolves the flag', async () => {
	const logFeatureAssignment = jest.fn();
	const fetchFlagPayload = jest.fn( async () => ( {
		schema_version: 1,
		flags: {
			my_flag: {
				value_type: 'string',
				default_value: 'control',
				rules: [
					{
						type: 'experiment',
						seed: 'my_flag.seed',
						hash_attribute: 'wpcom_user_id',
						experiment_id: 12345,
						variations: [
							{
								name: 'control',
								value: 'control',
								is_default: true,
								experiment_variation_id: 1,
								range: [ 0, 0.5 ],
							},
							{
								name: 'treatment',
								value: 'treatment',
								is_default: false,
								experiment_variation_id: 2,
								range: [ 0.5, 1 ],
							},
						],
					},
				],
			},
		},
		ttl: 60,
	} ) );
	const client = createExPlatClient( {
		fetchExperimentAssignment: jest.fn(),
		getAnonId: async () => 'anon-1',
		logError: jest.fn(),
		isDevelopmentMode: true,
		fetchFlagPayload,
		logFeatureAssignment,
		getAttributes: async () => ( { wpcom_user_id: '1' } ),
	} );
	// Mock the runtime so it would normally allow logging.
	jest.spyOn( runtimeModule, 'getExPlatRuntime' ).mockReturnValue( {
		schema_version: 1,
		mode: 'normal',
		can_evaluate: true,
		can_log_assignment: true,
		can_create_assignment: true,
		include_staging: false,
		attributes: {},
		ttl: 0,
	} );

	client.devtools.forcedFeatures.set( 'my_flag', 'treatment' );
	await client.getFeatureValue( 'my_flag', 'control' );

	expect( logFeatureAssignment ).not.toHaveBeenCalled();
	expect( fetchFlagPayload ).not.toHaveBeenCalled();
} );
```

Add `import * as runtimeModule from '../internal/runtime';` to the test file if not already present.

- [ ] **Step 2: Run the test**

Run: `yarn jest packages/explat-client/src/test/get-feature-value.test.ts -t "INVARIANT"`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git commit -am "test(explat): pin invariant — forced overrides never fire assignment beacon"
```

---

## Task 5: `getKnownFlags` and `getKnownVariations` helpers

Phase 1 UI dropdown will need these. They're cheap and ship now.

**Files:**
- Modify: `packages/explat-client/src/create-explat-client.ts`
- Test: `packages/explat-client/src/test/get-feature-value.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
describe( 'devtools.getKnownFlags / getKnownVariations', () => {
	const samplePayload = {
		schema_version: 1,
		flags: {
			a: {
				value_type: 'string',
				default_value: 'control',
				rules: [
					{
						type: 'experiment',
						seed: 'a.seed',
						hash_attribute: 'wpcom_user_id',
						experiment_id: 1,
						variations: [
							{
								name: 'control',
								value: 'control',
								is_default: true,
								experiment_variation_id: 1,
								range: [ 0, 0.5 ],
							},
							{
								name: 'treatment',
								value: 'treatment',
								is_default: false,
								experiment_variation_id: 2,
								range: [ 0.5, 1 ],
							},
						],
					},
				],
			},
		},
		ttl: 60,
	};

	it( 'getKnownFlags returns flag keys from cached payload', async () => {
		const client = createExPlatClient( {
			fetchExperimentAssignment: jest.fn(),
			getAnonId: async () => 'a',
			logError: jest.fn(),
			isDevelopmentMode: true,
			fetchFlagPayload: async () => samplePayload,
			logFeatureAssignment: jest.fn(),
			getAttributes: async () => ( {} ),
		} );
		await client.getFeatureValue( 'a', 'control' ); // primes cache
		expect( client.devtools.getKnownFlags() ).toEqual( [ 'a' ] );
	} );

	it( 'getKnownVariations returns the variation values defined for a flag', async () => {
		const client = createExPlatClient( {
			fetchExperimentAssignment: jest.fn(),
			getAnonId: async () => 'a',
			logError: jest.fn(),
			isDevelopmentMode: true,
			fetchFlagPayload: async () => samplePayload,
			logFeatureAssignment: jest.fn(),
			getAttributes: async () => ( {} ),
		} );
		await client.getFeatureValue( 'a', 'control' );
		expect( client.devtools.getKnownVariations( 'a' ) ).toEqual( [ 'control', 'treatment' ] );
	} );

	it( 'getKnownVariations returns [] for unknown flags', async () => {
		const client = createExPlatClient( {
			fetchExperimentAssignment: jest.fn(),
			getAnonId: async () => 'a',
			logError: jest.fn(),
			isDevelopmentMode: true,
			fetchFlagPayload: async () => samplePayload,
			logFeatureAssignment: jest.fn(),
			getAttributes: async () => ( {} ),
		} );
		expect( client.devtools.getKnownVariations( 'nope' ) ).toEqual( [] );
	} );
} );
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn jest packages/explat-client/src/test/get-feature-value.test.ts -t "getKnownFlags"`
Expected: FAIL — `client.devtools.getKnownFlags` is not a function.

- [ ] **Step 3: Implement**

In `create-explat-client.ts`, extend the `ExPlatClient.devtools` shape:

```ts
devtools: {
	forcedFeatures: ForcedFeatures;
	evalLog: EvalLog;
	getKnownFlags: () => string[];
	getKnownVariations: ( flagKey: string ) => FeatureValue[];
};
```

And inside `createExPlatClient`, add the implementations. Note: `flagPayloadCache.current` may be null until the first `getFeatureValue` call — that's expected, return empty arrays.

```ts
const getKnownFlags = (): string[] => {
	const payload = flagPayloadCache.current?.payload;
	return payload ? Object.keys( payload.flags ) : [];
};

const getKnownVariations = ( flagKey: string ): FeatureValue[] => {
	const feature = flagPayloadCache.current?.payload.flags[ flagKey ];
	if ( ! feature ) {
		return [];
	}
	const values: FeatureValue[] = [];
	for ( const rule of feature.rules ?? [] ) {
		if ( rule.type === 'experiment' && Array.isArray( rule.variations ) ) {
			for ( const v of rule.variations ) {
				values.push( v.value );
			}
		} else if ( rule.type === 'force' ) {
			values.push( rule.value );
		}
	}
	// Deduplicate while preserving order.
	const seen = new Set< string >();
	return values.filter( ( v ) => {
		const k = JSON.stringify( v );
		if ( seen.has( k ) ) {
			return false;
		}
		seen.add( k );
		return true;
	} );
};
```

Then add `getKnownFlags` and `getKnownVariations` to the `devtools` field in BOTH the live client and the SSR dummy returns.

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn jest packages/explat-client/src/test/get-feature-value.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git commit -am "feat(explat): expose getKnownFlags / getKnownVariations on devtools surface"
```

---

## Task 6: `window.__EXPLAT__` install (gated)

**Files:**
- Create: `packages/explat-client/src/internal/devtools-window.ts`
- Test: `packages/explat-client/src/internal/test/devtools-window.test.ts`
- Modify: `packages/explat-client/src/create-explat-client.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/explat-client/src/internal/test/devtools-window.test.ts
import { installDevtoolsWindow } from '../devtools-window';

describe( 'installDevtoolsWindow', () => {
	beforeEach( () => {
		delete ( window as unknown as Record< string, unknown > ).__EXPLAT__;
	} );

	it( 'attaches __EXPLAT__ when isDevelopmentMode is true', () => {
		installDevtoolsWindow( {
			devtools: makeFakeDevtools(),
			isDevelopmentMode: true,
			getRuntimeMode: () => 'normal',
		} );
		expect( ( window as any ).__EXPLAT__ ).toBeDefined();
		expect( typeof ( window as any ).__EXPLAT__.setForcedFeatures ).toBe( 'function' );
	} );

	it( 'attaches __EXPLAT__ when runtime mode is manual_testing (production a8c testers)', () => {
		installDevtoolsWindow( {
			devtools: makeFakeDevtools(),
			isDevelopmentMode: false,
			getRuntimeMode: () => 'manual_testing',
		} );
		expect( ( window as any ).__EXPLAT__ ).toBeDefined();
	} );

	it( 'does NOT attach __EXPLAT__ in normal production (regular users)', () => {
		installDevtoolsWindow( {
			devtools: makeFakeDevtools(),
			isDevelopmentMode: false,
			getRuntimeMode: () => 'normal',
		} );
		expect( ( window as any ).__EXPLAT__ ).toBeUndefined();
	} );

	it( 'setForcedFeatures accepts a Map', () => {
		const ff = makeFakeDevtools();
		installDevtoolsWindow( {
			devtools: ff,
			isDevelopmentMode: true,
			getRuntimeMode: () => 'normal',
		} );
		( window as any ).__EXPLAT__.setForcedFeatures(
			new Map( [
				[ 'a', 'treatment' ],
				[ 'b', true ],
			] )
		);
		expect( ff.forcedFeatures.get( 'a' ) ).toBe( 'treatment' );
		expect( ff.forcedFeatures.get( 'b' ) ).toBe( true );
	} );

	it( 'setForcedFeatures accepts a plain object', () => {
		const ff = makeFakeDevtools();
		installDevtoolsWindow( {
			devtools: ff,
			isDevelopmentMode: true,
			getRuntimeMode: () => 'normal',
		} );
		( window as any ).__EXPLAT__.setForcedFeatures( { a: 'treatment' } );
		expect( ff.forcedFeatures.get( 'a' ) ).toBe( 'treatment' );
	} );
} );

function makeFakeDevtools() {
	const { createForcedFeatures } = require( '../forced-features' );
	const { createEvalLog } = require( '../eval-log' );
	return {
		forcedFeatures: createForcedFeatures(),
		evalLog: createEvalLog( 100 ),
		getKnownFlags: () => [],
		getKnownVariations: () => [],
	};
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn jest packages/explat-client/src/internal/test/devtools-window.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// packages/explat-client/src/internal/devtools-window.ts
import type { FeatureValue } from '../sdk/types';
import type { ExPlatRuntimeMode } from './runtime';
import type { ForcedFeatures } from './forced-features';
import type { EvalLog } from './eval-log';

export type DevtoolsSurface = {
	forcedFeatures: ForcedFeatures;
	evalLog: EvalLog;
	getKnownFlags: () => string[];
	getKnownVariations: ( flagKey: string ) => FeatureValue[];
};

export type WindowExPlat = {
	setForcedFeatures: ( values: Map< string, FeatureValue > | Record< string, FeatureValue > ) => void;
	clearForcedFeatures: ( flagKey?: string ) => void;
	getForcedFeatures: () => Record< string, FeatureValue >;
	subscribe: ( listener: () => void ) => () => void;
	getKnownFlags: () => string[];
	getKnownVariations: ( flagKey: string ) => FeatureValue[];
	getLogs: () => ReturnType< EvalLog[ 'entries' ] >;
	clearLogs: () => void;
};

export function installDevtoolsWindow( params: {
	devtools: DevtoolsSurface;
	isDevelopmentMode: boolean;
	getRuntimeMode: () => ExPlatRuntimeMode;
} ): void {
	if ( typeof window === 'undefined' ) {
		return;
	}
	const allowed = params.isDevelopmentMode || params.getRuntimeMode() === 'manual_testing';
	if ( ! allowed ) {
		return;
	}
	const surface: WindowExPlat = {
		setForcedFeatures: ( values ) => {
			const entries =
				values instanceof Map ? Array.from( values.entries() ) : Object.entries( values );
			for ( const [ key, value ] of entries ) {
				params.devtools.forcedFeatures.set( key, value );
			}
		},
		clearForcedFeatures: ( flagKey ) => {
			if ( flagKey === undefined ) {
				params.devtools.forcedFeatures.clearAll();
			} else {
				params.devtools.forcedFeatures.clear( flagKey );
			}
		},
		getForcedFeatures: () => params.devtools.forcedFeatures.snapshot(),
		subscribe: ( listener ) => params.devtools.forcedFeatures.subscribe( () => listener() ),
		getKnownFlags: () => params.devtools.getKnownFlags(),
		getKnownVariations: ( flagKey ) => params.devtools.getKnownVariations( flagKey ),
		getLogs: () => params.devtools.evalLog.entries(),
		clearLogs: () => params.devtools.evalLog.clear(),
	};
	( window as unknown as Record< string, unknown > ).__EXPLAT__ = surface;
}
```

Then in `create-explat-client.ts`, after building the `devtools` object, call:

```ts
import { installDevtoolsWindow } from './internal/devtools-window';

// ...inside createExPlatClient, just before `return { ... }`:
installDevtoolsWindow( {
	devtools: { forcedFeatures, evalLog, getKnownFlags, getKnownVariations },
	isDevelopmentMode: config.isDevelopmentMode,
	getRuntimeMode: () => getExPlatRuntime().mode,
} );
```

Note: the runtime mode is read at install time. The current code has no need to re-install on runtime changes — `__EXPLAT_RUNTIME__` is a boot-time value emitted by the server.

- [ ] **Step 4: Run tests**

Run: `yarn jest packages/explat-client/`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/explat-client/src/internal/devtools-window.ts \
        packages/explat-client/src/internal/test/devtools-window.test.ts \
        packages/explat-client/src/create-explat-client.ts
git commit -m "feat(explat): install gated window.__EXPLAT__ debug surface"
```

---

## Task 7: Host wrapper — bootstrap from URL/cookie + subscribe `useFeatureValue`

**Files:**
- Create: `client/lib/explat/internals/dev-overrides-bootstrap.ts`
- Modify: `client/lib/explat/index.ts`
- Test: `client/lib/explat/internals/test/dev-overrides-bootstrap.test.ts`

- [ ] **Step 1: Write failing test for the URL/cookie bootstrap**

```ts
// client/lib/explat/internals/test/dev-overrides-bootstrap.test.ts
import { applyDevOverridesFromEnvironment } from '../dev-overrides-bootstrap';

describe( 'applyDevOverridesFromEnvironment', () => {
	it( 'parses a JSON object from ?_explat_force= in the URL and forces each entry', () => {
		const set = jest.fn();
		applyDevOverridesFromEnvironment( {
			search: '?_explat_force=' + encodeURIComponent( JSON.stringify( { a: 'treatment', b: true } ) ),
			cookieString: '',
			set,
		} );
		expect( set ).toHaveBeenCalledWith( 'a', 'treatment' );
		expect( set ).toHaveBeenCalledWith( 'b', true );
	} );

	it( 'falls back to the _explat_force cookie when query param is absent', () => {
		const set = jest.fn();
		applyDevOverridesFromEnvironment( {
			search: '',
			cookieString: '_explat_force=' + encodeURIComponent( JSON.stringify( { a: 'x' } ) ),
			set,
		} );
		expect( set ).toHaveBeenCalledWith( 'a', 'x' );
	} );

	it( 'silently ignores invalid JSON', () => {
		const set = jest.fn();
		expect( () =>
			applyDevOverridesFromEnvironment( {
				search: '?_explat_force=not-json',
				cookieString: '',
				set,
			} )
		).not.toThrow();
		expect( set ).not.toHaveBeenCalled();
	} );

	it( 'silently ignores non-object JSON (arrays, primitives)', () => {
		const set = jest.fn();
		applyDevOverridesFromEnvironment( {
			search: '?_explat_force=' + encodeURIComponent( JSON.stringify( [ 'a', 'b' ] ) ),
			cookieString: '',
			set,
		} );
		expect( set ).not.toHaveBeenCalled();
	} );
} );
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn test-client client/lib/explat/internals/test/dev-overrides-bootstrap.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the bootstrap**

```ts
// client/lib/explat/internals/dev-overrides-bootstrap.ts
import type { FeatureValue } from '@automattic/explat-client';

const QUERY_PARAM = '_explat_force';
const COOKIE_NAME = '_explat_force';

export function applyDevOverridesFromEnvironment( env: {
	search: string;
	cookieString: string;
	set: ( flagKey: string, value: FeatureValue ) => void;
} ): void {
	const raw = readFromQuery( env.search ) ?? readFromCookie( env.cookieString );
	if ( ! raw ) {
		return;
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse( raw );
	} catch {
		return;
	}
	if ( ! parsed || typeof parsed !== 'object' || Array.isArray( parsed ) ) {
		return;
	}
	for ( const [ key, value ] of Object.entries( parsed as Record< string, unknown > ) ) {
		env.set( key, value as FeatureValue );
	}
}

function readFromQuery( search: string ): string | undefined {
	if ( ! search ) {
		return undefined;
	}
	try {
		const params = new URLSearchParams( search.startsWith( '?' ) ? search.slice( 1 ) : search );
		return params.get( QUERY_PARAM ) ?? undefined;
	} catch {
		return undefined;
	}
}

function readFromCookie( cookieString: string ): string | undefined {
	for ( const part of cookieString.split( ';' ) ) {
		const [ rawName, ...rest ] = part.trim().split( '=' );
		if ( rawName === COOKIE_NAME ) {
			try {
				return decodeURIComponent( rest.join( '=' ) );
			} catch {
				return undefined;
			}
		}
	}
	return undefined;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test-client client/lib/explat/internals/test/dev-overrides-bootstrap.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Wire bootstrap and re-render into `client/lib/explat/index.ts`**

Replace the file with:

```ts
import { createExPlatClient, ExPlatSdk } from '@automattic/explat-client';
import createExPlatClientReactHelpers from '@automattic/explat-client-react-helpers';
import { useEffect, useState } from 'react';
import { getAnonId, initializeAnonId } from './internals/anon-id';
import { applyDevOverridesFromEnvironment } from './internals/dev-overrides-bootstrap';
import fetchExperimentAssignment from './internals/fetch-experiment-assignment';
import fetchFlagPayload from './internals/fetch-flag-payload';
import getAttributes from './internals/get-attributes';
import { logError } from './internals/log-error';
import logFeatureAssignment from './internals/log-feature-assignment';
import { isDevelopmentMode } from './internals/misc';

initializeAnonId().catch( ( e ) => logError( { message: e.message } ) );

const exPlatClient = createExPlatClient( {
	fetchExperimentAssignment,
	getAnonId,
	logError,
	isDevelopmentMode,
	fetchFlagPayload,
	logFeatureAssignment,
	getAttributes,
} );

// Seed forced overrides from URL / cookie. Idempotent, runs once at module load.
if ( typeof window !== 'undefined' ) {
	applyDevOverridesFromEnvironment( {
		search: window.location.search,
		cookieString: document.cookie,
		set: ( key, value ) => exPlatClient.devtools.forcedFeatures.set( key, value ),
	} );
}

export const { loadExperimentAssignment, dangerouslyGetExperimentAssignment, getFeatureValue } =
	exPlatClient;
const exPlatClientReactHelpers = createExPlatClientReactHelpers( exPlatClient );
export const { useExperiment, Experiment, ProvideExperimentData } = exPlatClientReactHelpers;

/**
 * React hook wrapper around `getFeatureValue`. Returns the caller default
 * synchronously, then re-renders with the resolved value once the flag payload
 * loads. Also re-evaluates whenever a forced override for `flagKey` changes,
 * so the dev toggle flips the UI live.
 */
export function useFeatureValue< T extends ExPlatSdk.FeatureValue >(
	flagKey: string,
	defaultValue: T
): ExPlatSdk.WidenPrimitives< T > {
	const [ value, setValue ] = useState< ExPlatSdk.WidenPrimitives< T > >(
		defaultValue as unknown as ExPlatSdk.WidenPrimitives< T >
	);
	useEffect( () => {
		let cancelled = false;
		const evaluate = () => {
			exPlatClient.getFeatureValue( flagKey, defaultValue ).then( ( resolved ) => {
				if ( ! cancelled ) {
					setValue( resolved );
				}
			} );
		};
		evaluate();
		const unsubscribe = exPlatClient.devtools.forcedFeatures.subscribe( ( event ) => {
			if ( event.key === null || event.key === flagKey ) {
				evaluate();
			}
		} );
		return () => {
			cancelled = true;
			unsubscribe();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ flagKey ] );
	return value;
}
```

- [ ] **Step 6: Run sidebar test from PR #110518 still passes**

Run: `yarn test-client --findRelatedTests client/lib/explat/index.ts client/my-sites/sidebar/use-site-menu-items.js`
Expected: all PASS, including the existing demo test.

- [ ] **Step 7: Commit**

```bash
git add client/lib/explat/index.ts \
        client/lib/explat/internals/dev-overrides-bootstrap.ts \
        client/lib/explat/internals/test/dev-overrides-bootstrap.test.ts
git commit -m "feat(explat): seed dev overrides from URL/cookie and re-render useFeatureValue on change"
```

---

## Task 8: Manual smoke test in the browser + PR

This task is non-TDD — it's the human verification gate before opening the PR. Runs against the actual Calypso dev server.

- [ ] **Step 1: Start the dev server**

```bash
yarn start
```

Expected: server boots on `$PORT` (default 3000).

- [ ] **Step 2: Console smoke test**

Open `http://calypso.localhost:3000/sites` in the browser, log in, then in DevTools Console:

```js
window.__EXPLAT__
// → object with setForcedFeatures, clearForcedFeatures, …

window.__EXPLAT__.setForcedFeatures( new Map( [ [ 'wpcom_explat_v2_demo_v1', 'treatment' ] ] ) );
// → undefined; sidebar 'My Home' should flip to 'My Dashboard' without reload
```

If the sidebar does not flip, check that:
- the sidebar is using `useFeatureValue` (PR #110518's `client/my-sites/sidebar/use-site-menu-items.js`),
- `exPlatClient.devtools.forcedFeatures.subscribe` was wired in Task 7.

- [ ] **Step 3: URL-param smoke test**

Reload the page with `?_explat_force=%7B%22wpcom_explat_v2_demo_v1%22%3A%22treatment%22%7D`.
Expected: sidebar reads "My Dashboard" on initial render.

- [ ] **Step 4: Production-mode safety check**

Run `yarn build` (production bundle). Open built bundle, log in as a non-a8c user (or simulate by mocking `isDevelopmentMode === false` and `runtime.mode === 'normal'`), confirm `window.__EXPLAT__ === undefined`. The cleanest local test: temporarily edit `client/lib/explat/internals/misc.ts` to return `isDevelopmentMode = false`, hard-refresh, observe `window.__EXPLAT__` is undefined, then revert the edit.

- [ ] **Step 5: Type-check and final unit tests**

Run in parallel:

```bash
yarn typecheck-client
yarn jest packages/explat-client/
yarn test-client --findRelatedTests client/lib/explat/index.ts
```

Expected: all clean.

- [ ] **Step 6: Open the PR (draft)**

Branch name: `explat-flag-dev-toggle` (already current). Stack on `explat-demo-my-dashboard`.

```bash
HTTPS_PROXY=socks5://127.0.0.1:8080 HTTP_PROXY=socks5://127.0.0.1:8080 \
  gh pr create --base explat-demo-my-dashboard --draft \
  --title "ExPlat: window.__EXPLAT__ dev toggle for forced flag overrides" \
  --body "$(cat <<'EOF'
Phase 0 of the ExPlat dev tooling — adds an SDK-level forced-features override surface so engineers (and a8c manual testers in prod) can flip flag values from the browser console and via URL param, with live re-render of `useFeatureValue` consumers. No UI panel yet — that's Phase 1.

## Proposed Changes

- New SDK internals: `forced-features.ts`, `eval-log.ts`, `devtools-window.ts`.
- `getFeatureValue` checks the forced-features map first, suppresses the `/assignments/log` beacon for forced values, and records every evaluation to a 200-entry ring buffer.
- `client.devtools.{forcedFeatures, evalLog, getKnownFlags, getKnownVariations}` is the stable contract.
- `window.__EXPLAT__` is gated to `isDevelopmentMode || runtime.mode === 'manual_testing'`.
- Host wrapper seeds overrides from `?_explat_force=<json>` and `_explat_force` cookie at boot.
- `useFeatureValue` subscribes to override changes for live re-render.

## Why are these changes being made?

- Toggling a flag and seeing the UI flip live is the highest-leverage local dev experience for ExPlat v2.
- Done at the SDK layer rather than as a Chrome extension or MissionControl page so every consumer (Calypso, Dashboard, Jetpack Cloud) gets it for free.
- Forced values bypass the assignment beacon — pinned by an explicit invariant test — so dev toggling cannot pollute experiment data.

## Testing Instructions

- `yarn jest packages/explat-client/` — new tests pass alongside existing ones.
- `yarn test-client --findRelatedTests client/lib/explat/index.ts` — sidebar demo still works.
- Manual: start dev server, in console run `window.__EXPLAT__.setForcedFeatures(new Map([['wpcom_explat_v2_demo_v1','treatment']]))` and confirm 'My Home' flips to 'My Dashboard' without reload.
- `?_explat_force=%7B%22wpcom_explat_v2_demo_v1%22%3A%22treatment%22%7D` flips the label on initial render.

## Pre-merge Checklist

- [x] Has the general commit checklist been followed? (PCYsg-hS-p2)
- [x] Have you written new tests for your changes?
- [ ] Have you tested the feature in Simple, Atomic, and self-hosted Jetpack sites?
- [x] Have you checked for TypeScript, React or other console errors?
- [ ] Have you tested accessibility for your changes?
- [ ] Have you used memoizing on expensive computations?
- [ ] Have we added the "[Status] String Freeze" label?
- [ ] For changes affecting Jetpack: privacy updates label?
EOF
)"
```

---

## Out of scope (Phase 1+, separate plans)

- **Visual overlay panel** with flag list, toggles, and variation dropdown sourced from `getKnownVariations`. Should consume `window.__EXPLAT__` exactly as a future Chrome extension would, no privileged access.
- **Chrome extension** mirroring the in-page panel. Same data source, different rendering surface.
- **MissionControl read-only authoring view** — read flag definitions, not toggle.
- **Tightening gating to `is_manual_testing` runtime attribute** once wpcom PR 4 ships and `__EXPLAT_RUNTIME__.attributes.is_manual_testing` is reliable. Today the gate is `runtime.mode === 'manual_testing'`, which is set server-side on a per-request basis.
