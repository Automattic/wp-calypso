import { installDevtoolsWindow } from './internal/devtools-window';
import { createEvalLog, type EvalLog } from './internal/eval-log';
import {
	retrieveExperimentAssignment,
	storeExperimentAssignment,
	removeExpiredExperimentAssignments,
} from './internal/experiment-assignment-store';
import * as ExperimentAssignments from './internal/experiment-assignments';
import { createFallbackExperimentAssignment as createFallbackExperimentAssignment } from './internal/experiment-assignments';
import { createFlagPayloadLoader } from './internal/flag-payload';
import { createForcedFeatures, type ForcedFeatures } from './internal/forced-features';
import * as Request from './internal/requests';
import { createExPlatRuntimeReader } from './internal/runtime';
import * as Timing from './internal/timing';
import * as Validation from './internal/validations';
import { evalFeature } from './sdk/evaluator';
import type { Attributes, FeatureValue, Result, WidenPrimitives } from './sdk/types';
import type { ExperimentAssignment, Config, FeatureAssignmentBeacon } from './types';

/**
 * The maximum number of `getFeatureValue` evaluations retained in the
 * in-memory eval log. Surfaced via `client.devtools.evalLog.entries()`.
 */
const EVAL_LOG_CAPACITY = 200;

export interface ExPlatDevtools {
	forcedFeatures: ForcedFeatures;
	evalLog: EvalLog;
	/**
	 * Flag keys present in the most recently fetched payload. Empty array
	 * before the first successful fetch.
	 */
	getKnownFlags: () => string[];
	/**
	 * Variation values defined for `flagKey` in the most recently fetched
	 * payload. Empty array if the flag is unknown or no payload is cached.
	 * Phase 1 dropdowns can use this to *suggest* values; the override store
	 * itself accepts any `FeatureValue`.
	 */
	getKnownVariations: ( flagKey: string ) => FeatureValue[];
	/**
	 * Richer per-flag metadata for UI surfaces: experiment IDs, variation
	 * names, hash attribute, default value. Pulled from the cached payload —
	 * empty/null fields when no payload is cached or the flag is unknown.
	 */
	getFlagInfo: ( flagKey: string ) => {
		experimentId: number | null;
		hashAttribute: string | null;
		defaultValue: FeatureValue | null;
		variations: Array< { name: string; value: FeatureValue; isDefault: boolean } >;
		/**
		 * Raw rules in payload order. The panel surfaces this so devs can see
		 * exactly which rule resolved their value (one is highlighted as the
		 * match) and what condition each rule has.
		 */
		rules: Array<
			| {
					index: number;
					type: 'force';
					value: FeatureValue;
					condition: unknown | null;
			  }
			| {
					index: number;
					type: 'experiment';
					experimentId: number;
					hashAttribute: string;
					condition: unknown | null;
					variations: Array< { name: string; value: FeatureValue } >;
			  }
		>;
	} | null;
	/**
	 * Evaluate `flagKey` against the live `/flags` payload as if no forced
	 * override existed and as if the call were a render-time dry run:
	 *  - skips the forced-features map,
	 *  - never fires `/assignments/log`,
	 *  - never appends to the eval log.
	 *
	 * Returns the {@link Result} (with `source: 'experiment' | 'force' | 'default'`),
	 * or `null` when evaluation isn't possible (no payload, runtime blocks
	 * evaluation, fetch hasn't happened yet, flag unknown). The dev panel
	 * uses this to display "the variation you'd land in if you weren't
	 * forcing one."
	 */
	previewFeatureValue: ( flagKey: string ) => Promise< Result | null >;
	/**
	 * Returns the full attribute map that would be passed to `evalFeature`,
	 * merging host-supplied local attributes with the server's
	 * `__EXPLAT_RUNTIME__.attributes`. Surfaced for the dev panel to compute
	 * "do I qualify for this rule's condition?" via `ExPlatSdk.evalCondition`
	 * without re-routing through the full `getFeatureValue` path.
	 *
	 * Returns `null` when the host didn't wire `getAttributes` or evaluation
	 * isn't possible (runtime blocks).
	 */
	getEvaluationAttributes: () => Promise< Attributes | null >;
	/**
	 * Raw `Feature` entry from the cached `/flags` payload — the exact shape
	 * the eval engine sees, with `value_type`, `default_value`, and `rules`.
	 * Returns `null` when no payload is cached or the flag isn't present.
	 * Useful for the "Copy JSON" affordance in the dev panel.
	 */
	getRawFeature: ( flagKey: string ) => unknown | null;
	/**
	 * Trigger a `/flags` fetch from the dev panel without going through
	 * `getFeatureValue`. Resolves once the SDK's flag cache has been
	 * populated (or with an empty list on failure / when the host did not
	 * wire `fetchFlagPayload`). Pass `{ force: true }` to bypass the TTL
	 * cache and re-fetch.
	 *
	 * Used by the dev panel to populate the flag list eagerly on mount and
	 * to back the Refresh button.
	 */
	loadFlags: ( options?: { force?: boolean } ) => Promise< string[] >;
}

/**
 * The number of milliseconds before we abandon fetching an experiment
 */
const EXPERIMENT_FETCH_TIMEOUT = 10000;

export interface ExPlatClient {
	/**
	 * Loads and returns an Experiment Assignment Promise, starting an assignment if necessary.
	 *
	 * Call as many times as you like, it will only make one request at a time (per experiment) and
	 * will only trigger a request when the assignment TTL is expired.
	 *
	 * Will never throw in production, it will return the default assignment.
	 * It should not be run on the server but it won't crash anything.
	 * @param experimentName The experiment's name
	 */
	loadExperimentAssignment: ( experimentName: string ) => Promise< ExperimentAssignment >;

	/**
	 * Get an already loaded Experiment Assignment, will throw if there is an error, e.g. if it hasn't been loaded.
	 *
	 * Make sure loadExperimentAssignment has been called before calling this function.
	 *
	 */
	dangerouslyGetExperimentAssignment: ( experimentName: string ) => ExperimentAssignment;

	/**
	 * Get an experiment assignment, return null if it hasn't been loaded.
	 *
	 * Only intended for use in useExperiment hook.
	 */
	dangerouslyGetMaybeLoadedExperimentAssignment: (
		experimentName: string
	) => null | ExperimentAssignment;

	/**
	 * Evaluate a feature flag client-side against the public `/flags` payload.
	 *
	 * Returns the caller-provided default when:
	 *  - the host has not provided `fetchFlagPayload` / `getAttributes`,
	 *  - the runtime bootstrap forbids evaluation (e2e/support/blocked modes),
	 *  - the flag is unknown, or
	 *  - the payload is malformed / on an unsupported schema_version.
	 *
	 * For experiment-rule matches, fires a fire-and-forget beacon to
	 * `logFeatureAssignment` only when the runtime is in `mode='normal'` with
	 * `can_log_assignment` and `can_create_assignment` both true. The server
	 * recomputes and enforces gates regardless.
	 */
	getFeatureValue: < T extends FeatureValue >(
		flagKey: string,
		defaultValue: T
	) => Promise< WidenPrimitives< T > >;

	/**
	 * Dev / manual-testing surface. Stable contract:
	 *  - `forcedFeatures` — set/clear overrides applied before any fetch/eval
	 *  - `evalLog` — last N evaluations of `getFeatureValue`
	 * Always present on the client object regardless of mode; the
	 * `window.__EXPLAT__` global that exposes this externally is gated separately.
	 */
	devtools: ExPlatDevtools;

	/**
	 * INTERNAL USE ONLY
	 */
	config: Config;
}

export class MissingExperimentAssignmentError extends Error {
	constructor( message?: string ) {
		super( message );

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if ( Error.captureStackTrace ) {
			Error.captureStackTrace( this, MissingExperimentAssignmentError );
		}

		this.name = 'MissingExperimentAssignmentError';
	}
}

/**
 * Create an ExPlat Client
 * @param config Configuration object
 */
export function createExPlatClient( config: Config ): ExPlatClient {
	if ( typeof window === 'undefined' ) {
		throw new Error( 'Running outside of a browser context.' );
	}

	/**
	 * This bit of code is the heavy lifting behind loadExperimentAssignment, allowing it to be used intuitively.
	 *
	 * Using asyncOneAtATime, is how we ensure for each experiment that there is only ever one fetch process occuring.
	 * @param experimentName The experiment's name
	 */
	const createWrappedExperimentAssignmentFetchAndStore = ( experimentName: string ) =>
		Timing.asyncOneAtATime( async () => {
			const fetchedExperimentAssignment = await Request.fetchExperimentAssignment(
				config,
				experimentName
			);
			storeExperimentAssignment( fetchedExperimentAssignment );
			return fetchedExperimentAssignment;
		} );
	const experimentNameToWrappedExperimentAssignmentFetchAndStore: Record<
		string,
		() => Promise< ExperimentAssignment >
	> = {};

	const safeLogError: typeof config.logError = ( ...args ) => {
		try {
			config.logError( ...args );
		} catch ( e ) {}
	};

	const getExPlatRuntime = createExPlatRuntimeReader( config.isDevelopmentMode );

	/**
	 * Dev-mode console stream. Gated identically to `window.__EXPLAT__` so
	 * regular production users never see it. Use a single `[ExPlat]` prefix
	 * for cheap DevTools filtering.
	 */
	const debugEnabled = (): boolean =>
		config.isDevelopmentMode || getExPlatRuntime().mode === 'manual_testing';
	const debug = ( ...args: unknown[] ): void => {
		if ( debugEnabled() ) {
			// eslint-disable-next-line no-console
			console.log( '[ExPlat]', ...args );
		}
	};

	const fetchFlagPayload = config.fetchFlagPayload;
	const wrappedFetchFlagPayload = fetchFlagPayload
		? async () => {
				const raw = await fetchFlagPayload();
				if ( debugEnabled() && raw && typeof raw === 'object' ) {
					const flags = ( raw as { flags?: Record< string, unknown > } ).flags ?? {};
					debug( 'payload loaded', {
						flag_count: Object.keys( flags ).length,
						flag_keys: Object.keys( flags ),
						payload: raw,
					} );
				}
				return raw;
		  }
		: null;
	const flagPayloadLoader = wrappedFetchFlagPayload
		? createFlagPayloadLoader( wrappedFetchFlagPayload, safeLogError )
		: null;

	const forcedFeatures = createForcedFeatures();
	const evalLog = createEvalLog( EVAL_LOG_CAPACITY );

	const getKnownFlags = (): string[] => {
		const payload = flagPayloadLoader?.getCached();
		return payload ? Object.keys( payload.flags ) : [];
	};

	const loadFlags = async ( options?: { force?: boolean } ): Promise< string[] > => {
		if ( ! flagPayloadLoader ) {
			return [];
		}
		const runtime = getExPlatRuntime();
		if ( ! runtime.can_evaluate ) {
			return [];
		}
		const payload = await flagPayloadLoader.load( options );
		return payload ? Object.keys( payload.flags ) : [];
	};

	/**
	 * Natural evaluation path shared by `getFeatureValue` and `previewFeatureValue`.
	 * Returns the eval result + the local attributes used (caller decides
	 * whether to log/beacon), or null when evaluation can't happen.
	 */
	const evaluateNaturally = async (
		flagKey: string
	): Promise< { result: Result; localAttributes: Record< string, string > } | null > => {
		if ( ! flagPayloadLoader || ! config.getAttributes ) {
			return null;
		}
		const runtime = getExPlatRuntime();
		if ( ! runtime.can_evaluate ) {
			return null;
		}
		const payload = await flagPayloadLoader.load();
		if ( ! payload ) {
			return null;
		}
		const feature = payload.flags[ flagKey ];
		if ( ! feature ) {
			return null;
		}
		const localAttributes = await config.getAttributes();
		const attributes = {
			...localAttributes,
			...runtime.attributes,
		} as Attributes;
		return { result: evalFeature( feature, attributes ), localAttributes };
	};

	const getRawFeature = ( flagKey: string ): unknown | null => {
		return flagPayloadLoader?.getCached()?.flags[ flagKey ] ?? null;
	};

	const getEvaluationAttributes = async (): Promise< Attributes | null > => {
		if ( ! config.getAttributes ) {
			return null;
		}
		try {
			const local = await config.getAttributes();
			const runtime = getExPlatRuntime();
			return { ...local, ...runtime.attributes } as Attributes;
		} catch {
			return null;
		}
	};

	const previewFeatureValue = async ( flagKey: string ): Promise< Result | null > => {
		try {
			const evaluated = await evaluateNaturally( flagKey );
			return evaluated ? evaluated.result : null;
		} catch ( error ) {
			safeLogError( {
				message: ( error as Error ).message,
				flag_key: flagKey,
				source: 'previewFeatureValue-error',
			} );
			return null;
		}
	};

	const getFlagInfo = ( flagKey: string ) => {
		const feature = flagPayloadLoader?.getCached()?.flags[ flagKey ];
		if ( ! feature ) {
			return null;
		}
		const experimentRule = ( feature.rules ?? [] ).find( ( r ) => r.type === 'experiment' );
		const variations: Array< { name: string; value: FeatureValue; isDefault: boolean } > = [];
		for ( const rule of feature.rules ?? [] ) {
			if ( rule.type === 'experiment' && Array.isArray( rule.variations ) ) {
				for ( const v of rule.variations ) {
					variations.push( { name: v.name, value: v.value, isDefault: v.is_default } );
				}
			}
		}
		const rules = ( feature.rules ?? [] ).map( ( rule, index ) => {
			if ( rule.type === 'force' ) {
				return {
					index,
					type: 'force' as const,
					value: rule.value,
					condition: rule.condition ?? null,
				};
			}
			return {
				index,
				type: 'experiment' as const,
				experimentId: rule.experiment_id,
				hashAttribute: rule.hash_attribute,
				condition: rule.condition ?? null,
				variations: ( rule.variations ?? [] ).map( ( v ) => ( {
					name: v.name,
					value: v.value,
				} ) ),
			};
		} );
		return {
			experimentId: experimentRule?.type === 'experiment' ? experimentRule.experiment_id : null,
			hashAttribute: experimentRule?.type === 'experiment' ? experimentRule.hash_attribute : null,
			defaultValue: feature.default_value ?? null,
			variations,
			rules,
		};
	};

	const getKnownVariations = ( flagKey: string ): FeatureValue[] => {
		const feature = flagPayloadLoader?.getCached()?.flags[ flagKey ];
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
		// Dedupe while preserving order. Use JSON.stringify as a simple equality
		// proxy — values are already constrained to FeatureValue (JSON-safe).
		const seen = new Set< string >();
		return values.filter( ( v ) => {
			const key = JSON.stringify( v );
			if ( seen.has( key ) ) {
				return false;
			}
			seen.add( key );
			return true;
		} );
	};

	const fireFeatureAssignmentBeacon = async ( body: FeatureAssignmentBeacon ): Promise< void > => {
		try {
			await config.logFeatureAssignment?.( body );
		} catch ( e ) {
			safeLogError( {
				message: ( e as Error ).message,
				flag_key: body.flag_key,
				source: 'logFeatureAssignment-error',
			} );
		}
	};

	installDevtoolsWindow( {
		devtools: {
			forcedFeatures,
			evalLog,
			getKnownFlags,
			getKnownVariations,
			getFlagInfo,
			getRawFeature,
			previewFeatureValue,
			getEvaluationAttributes,
			loadFlags,
		},
		isDevelopmentMode: config.isDevelopmentMode,
		getRuntimeMode: () => getExPlatRuntime().mode,
	} );

	// Clean up LocalStorage on start up
	try {
		removeExpiredExperimentAssignments();
	} catch ( error ) {
		safeLogError( {
			message: ( error as Error ).message,
			source: 'removeExpiredExperimentAssignments-error',
		} );
	}

	return {
		loadExperimentAssignment: async ( experimentName: string ): Promise< ExperimentAssignment > => {
			try {
				if ( ! Validation.isName( experimentName ) ) {
					throw new Error( `Invalid experimentName: "${ experimentName }"` );
				}

				const storedExperimentAssignment = retrieveExperimentAssignment( experimentName );
				if (
					storedExperimentAssignment &&
					ExperimentAssignments.isAlive( storedExperimentAssignment )
				) {
					return storedExperimentAssignment;
				}

				if (
					experimentNameToWrappedExperimentAssignmentFetchAndStore[ experimentName ] === undefined
				) {
					experimentNameToWrappedExperimentAssignmentFetchAndStore[ experimentName ] =
						createWrappedExperimentAssignmentFetchAndStore( experimentName );
				}

				// Temporarilly running an A/B experiment on the timeout, see https://github.com/Automattic/wp-calypso/pull/54507
				let experimentFetchTimeout = EXPERIMENT_FETCH_TIMEOUT;
				if ( Math.random() > 0.5 ) {
					experimentFetchTimeout = 5000;
				}

				// We time out the request here and not above so the fetch-and-store continues and can be
				// returned by future uses of loadExperimentAssignment.
				const fetchedExperimentAssignment = await Timing.timeoutPromise(
					experimentNameToWrappedExperimentAssignmentFetchAndStore[ experimentName ](),
					experimentFetchTimeout
				);
				if ( ! fetchedExperimentAssignment ) {
					throw new Error( 'Could not fetch ExperimentAssignment' );
				}

				return fetchedExperimentAssignment;
			} catch ( initialError ) {
				safeLogError( {
					message: ( initialError as Error ).message,
					experimentName,
					source: 'loadExperimentAssignment-initialError',
				} );
			}

			// Fetching failed and we're not in development mode.
			try {
				// We provide stale ExperimentAssignments, important for offline users.
				const storedExperimentAssignment = retrieveExperimentAssignment( experimentName );
				if ( storedExperimentAssignment ) {
					return storedExperimentAssignment;
				}

				// We are syncronously trying to retrieve and then store a fallback which means this fallback will
				// be retrieved by all other loadExperimentAssignments that are currently running or will run,
				// preventing a run on the server.
				const fallbackExperimentAssignment = createFallbackExperimentAssignment( experimentName );
				storeExperimentAssignment( fallbackExperimentAssignment );
				return fallbackExperimentAssignment;
			} catch ( fallbackError ) {
				safeLogError( {
					message: ( fallbackError as Error ).message,
					experimentName,
					source: 'loadExperimentAssignment-fallbackError',
				} );

				// As a last resort we just keep it very simple
				return createFallbackExperimentAssignment( experimentName );
			}
		},
		dangerouslyGetExperimentAssignment: ( experimentName: string ): ExperimentAssignment => {
			try {
				if ( ! Validation.isName( experimentName ) ) {
					throw new Error( `Invalid experimentName: ${ experimentName }` );
				}

				const storedExperimentAssignment = retrieveExperimentAssignment( experimentName );
				if ( ! storedExperimentAssignment ) {
					throw new Error(
						"Trying to dangerously get an ExperimentAssignment that hasn't loaded."
					);
				}

				// We want to be loud in development mode to help pick up any issues:
				if ( config.isDevelopmentMode ) {
					// Highlight when we dangerously get an experiment too soon to when we load one:
					if (
						storedExperimentAssignment &&
						Timing.monotonicNow() - storedExperimentAssignment.retrievedTimestamp < 1000
					) {
						safeLogError( {
							message:
								'Warning: Trying to dangerously get an ExperimentAssignment too soon after loading it.',
							experimentName,
							source: 'dangerouslyGetExperimentAssignment',
						} );
					}
				}

				return storedExperimentAssignment;
			} catch ( error ) {
				if ( config.isDevelopmentMode ) {
					safeLogError( {
						message: ( error as Error ).message,
						experimentName,
						source: 'dangerouslyGetExperimentAssignment-error',
					} );
				}
				return createFallbackExperimentAssignment( experimentName );
			}
		},
		getFeatureValue: async < T extends FeatureValue >(
			flagKey: string,
			defaultValue: T
		): Promise< WidenPrimitives< T > > => {
			const fallback = defaultValue as unknown as WidenPrimitives< T >;

			// Override branch: runs before any fetch/eval. No `/flags` call, no
			// `/assignments/log` beacon. Pinned by the invariant test in
			// internal/test/get-feature-value.ts.
			if ( forcedFeatures.has( flagKey ) ) {
				const forced = forcedFeatures.get( flagKey ) as WidenPrimitives< T >;
				evalLog.record( {
					flag_key: flagKey,
					value: forced as FeatureValue,
					source: 'override',
					timestamp: Date.now(),
					attributes: {},
				} );
				debug( `${ flagKey } → forced`, {
					flag_key: flagKey,
					default_value: defaultValue,
					resolved_value: forced,
					source: 'override',
				} );
				return forced;
			}

			try {
				const evaluated = await evaluateNaturally( flagKey );
				const runtime = getExPlatRuntime();
				if ( ! evaluated ) {
					evalLog.record( {
						flag_key: flagKey,
						value: defaultValue,
						source: 'fallback',
						timestamp: Date.now(),
						attributes: runtime.attributes,
					} );
					const fallbackReason = ( () => {
						if ( ! flagPayloadLoader ) {
							return 'host did not wire fetchFlagPayload';
						}
						if ( ! config.getAttributes ) {
							return 'host did not wire getAttributes';
						}
						if ( ! runtime.can_evaluate ) {
							return `runtime mode=${ runtime.mode } cannot evaluate`;
						}
						return 'no payload, or flag unknown';
					} )();
					debug( `${ flagKey } → fallback`, {
						flag_key: flagKey,
						default_value: defaultValue,
						resolved_value: defaultValue,
						source: 'fallback',
						reason: fallbackReason,
						runtime_mode: runtime.mode,
						runtime_attributes: runtime.attributes,
					} );
					return fallback;
				}

				const { result, localAttributes } = evaluated;
				const mergedAttributes = {
					...localAttributes,
					...runtime.attributes,
				};

				evalLog.record( {
					flag_key: flagKey,
					value: result.value,
					source: result.source,
					timestamp: Date.now(),
					attributes: localAttributes,
				} );

				const baseLogPayload = {
					flag_key: flagKey,
					default_value: defaultValue,
					resolved_value: result.value,
					source: result.source,
					attributes: mergedAttributes,
					local_attributes: localAttributes,
					runtime_mode: runtime.mode,
					runtime_attributes: runtime.attributes,
				};

				if ( result.source === 'experiment' ) {
					debug( `${ flagKey } → experiment`, {
						...baseLogPayload,
						experiment_id: result.experiment_id,
						experiment_variation_id: result.experiment_variation_id,
						hash_attribute: result.hash_attribute,
						hash_value: result.hash_value,
					} );
				} else if ( result.source === 'force' ) {
					debug( `${ flagKey } → force rule`, baseLogPayload );
				} else {
					debug( `${ flagKey } → default`, baseLogPayload );
				}

				if (
					result.source === 'experiment' &&
					runtime.mode === 'normal' &&
					runtime.can_log_assignment &&
					runtime.can_create_assignment
				) {
					// Fire-and-forget: don't await the beacon. Failures are logged + swallowed.
					// No client-side dedupe — the server's `Assigned_Variation` writers
					// already short-circuit duplicate `(user|anon, experiment)` rows.
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
		dangerouslyGetMaybeLoadedExperimentAssignment: (
			experimentName: string
		): ExperimentAssignment | null => {
			try {
				if ( ! Validation.isName( experimentName ) ) {
					throw new Error( `Invalid experimentName: ${ experimentName }` );
				}

				const storedExperimentAssignment = retrieveExperimentAssignment( experimentName );
				if ( ! storedExperimentAssignment ) {
					return null;
				}

				return storedExperimentAssignment;
			} catch ( error ) {
				if ( config.isDevelopmentMode ) {
					safeLogError( {
						message: ( error as Error ).message,
						experimentName,
						source: 'dangerouslyGetMaybeLoadedExperimentAssignment-error',
					} );
				}
				return createFallbackExperimentAssignment( experimentName );
			}
		},
		devtools: {
			forcedFeatures,
			evalLog,
			getKnownFlags,
			getKnownVariations,
			getFlagInfo,
			getRawFeature,
			previewFeatureValue,
			getEvaluationAttributes,
			loadFlags,
		},
		config,
	};
}

/**
 * A dummy ExPlat client to sub in under SSR contexts
 * @param config The config
 */
export function createSsrSafeDummyExPlatClient( config: Config ): ExPlatClient {
	return {
		loadExperimentAssignment: async ( experimentName: string ) => {
			config.logError( {
				message: 'Attempting to load ExperimentAssignment in SSR context',
				experimentName,
			} );
			return createFallbackExperimentAssignment( experimentName );
		},
		dangerouslyGetExperimentAssignment: ( experimentName: string ) => {
			config.logError( {
				message: 'Attempting to dangerously get ExperimentAssignment in SSR context',
				experimentName,
			} );
			return createFallbackExperimentAssignment( experimentName );
		},
		dangerouslyGetMaybeLoadedExperimentAssignment: ( experimentName: string ) => {
			config.logError( {
				message: 'Attempting to dangerously get ExperimentAssignment in SSR context',
				experimentName,
			} );
			return createFallbackExperimentAssignment( experimentName );
		},
		getFeatureValue: async < T extends FeatureValue >(
			_flagKey: string,
			defaultValue: T
		): Promise< WidenPrimitives< T > > => {
			return defaultValue as unknown as WidenPrimitives< T >;
		},
		devtools: {
			forcedFeatures: createForcedFeatures(),
			evalLog: createEvalLog( 0 ),
			getKnownFlags: () => [],
			getKnownVariations: () => [],
			getFlagInfo: () => null,
			getRawFeature: () => null,
			previewFeatureValue: async () => null,
			getEvaluationAttributes: async () => null,
			loadFlags: async () => [],
		},
		config,
	};
}
