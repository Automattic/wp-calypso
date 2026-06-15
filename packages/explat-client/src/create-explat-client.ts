import {
	retrieveExperimentAssignment,
	storeExperimentAssignment,
	removeExpiredExperimentAssignments,
} from './internal/experiment-assignment-store';
import * as ExperimentAssignments from './internal/experiment-assignments';
import { createFallbackExperimentAssignment as createFallbackExperimentAssignment } from './internal/experiment-assignments';
import { createFlagPayloadLoader } from './internal/flag-payload';
import * as Request from './internal/requests';
import { createExPlatRuntimeReader } from './internal/runtime';
import * as Timing from './internal/timing';
import * as Validation from './internal/validations';
import { evalFeature } from './sdk/evaluator';
import type { Attributes, FeatureValue, WidenPrimitives } from './sdk/types';
import type { ExperimentAssignment, Config, FeatureAssignmentBeacon } from './types';

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
	 * Warm the `/flags` payload cache without evaluating a specific flag.
	 *
	 * Fire-and-forget from an app entry point (route handler, section root) so
	 * the first `getFeatureValue` call hits a primed cache. Concurrent calls and
	 * any later `getFeatureValue` calls share the same in-flight fetch via the
	 * loader's internal `asyncOneAtATime`.
	 *
	 * Resolves once the payload is loaded (or once the fetch fails — errors are
	 * logged via `logError` but never rejected here). Resolves immediately when
	 * the host has not configured `fetchFlagPayload`.
	 */
	prefetchFlagPayload: () => Promise< void >;

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

	const fetchFlagPayload = config.fetchFlagPayload;
	const loadFlagPayload = fetchFlagPayload
		? createFlagPayloadLoader( fetchFlagPayload, safeLogError )
		: null;
	const getExPlatRuntime = createExPlatRuntimeReader();

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
			try {
				if ( ! loadFlagPayload || ! config.getAttributes ) {
					return fallback;
				}

				const runtime = getExPlatRuntime();
				if ( ! runtime.can_evaluate ) {
					return fallback;
				}

				const payload = await loadFlagPayload();
				if ( ! payload ) {
					return fallback;
				}

				const feature = payload.flags[ flagKey ];
				if ( ! feature ) {
					return fallback;
				}

				const localAttributes = await config.getAttributes();
				const attributes = {
					...localAttributes,
					...runtime.attributes,
				} as Attributes;

				const result = evalFeature( feature, attributes );

				if (
					result.source === 'experiment' &&
					runtime.mode === 'normal' &&
					runtime.can_log_assignment &&
					runtime.can_create_assignment
				) {
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
		prefetchFlagPayload: async (): Promise< void > => {
			if ( ! loadFlagPayload ) {
				return;
			}
			await loadFlagPayload();
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
		prefetchFlagPayload: async (): Promise< void > => {
			// No-op under SSR; the browser client warms the cache.
		},
		config,
	};
}
