/**
 * Internal dependencies
 */
import type { ExperimentAssignment, Config } from './types';
import * as ExperimentAssignments from './internal/experiment-assignments';
import * as Request from './internal/requests';
import ExperimentAssignmentStore from './internal/experiment-assignment-store';
import * as Timing from './internal/timing';
import * as Validation from './internal/validations';
import { createFallbackExperimentAssignment as createFallbackExperimentAssignment } from './internal/experiment-assignments';

/**
 * The number of milliseconds before we abandon fetching an experiment
 */
const EXPERIMENT_FETCH_TIMEOUT = 5000;

export interface ExPlatClient {
	/**
	 * Loads and returns an Experiment Assignment Promise, starting an assignment if necessary.
	 *
	 * Call as many times as you like, it will only make one request at a time (per experiment) and
	 * will only trigger a request when the assignment TTL is expired.
	 *
	 * Will never throw in production, it will return the default assignment.
	 * It should not be run on the server but it won't crash anything.
	 *
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
 *
 * @param config Configuration object
 */
export function createExPlatClient( config: Config ): ExPlatClient {
	if ( typeof window === 'undefined' ) {
		throw new Error( 'Running outside of a browser context.' );
	}

	const experimentAssignmentStore = new ExperimentAssignmentStore();

	/**
	 * This bit of code is the heavy lifting behind loadExperimentAssignment, allowing it to be used intuitively.
	 *
	 * Using asyncOneAtATime, is how we ensure for each experiment that there is only ever one fetch process occuring.
	 *
	 *
	 * @param experimentName The experiment's name
	 */
	const createWrappedExperimentAssignmentFetchAndStore = ( experimentName: string ) =>
		Timing.asyncOneAtATime( async () => {
			const fetchedExperimentAssignment = await Request.fetchExperimentAssignment(
				config,
				experimentName
			);
			experimentAssignmentStore.store( fetchedExperimentAssignment );
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

	return {
		loadExperimentAssignment: async ( experimentName: string ): Promise< ExperimentAssignment > => {
			try {
				if ( ! Validation.isName( experimentName ) ) {
					throw new Error( `Invalid experimentName: "${ experimentName }"` );
				}

				const storedExperimentAssignment = experimentAssignmentStore.retrieve( experimentName );
				if (
					storedExperimentAssignment &&
					ExperimentAssignments.isAlive( storedExperimentAssignment )
				) {
					return storedExperimentAssignment;
				}

				if (
					experimentNameToWrappedExperimentAssignmentFetchAndStore[ experimentName ] === undefined
				) {
					experimentNameToWrappedExperimentAssignmentFetchAndStore[
						experimentName
					] = createWrappedExperimentAssignmentFetchAndStore( experimentName );
				}
				// We time out the request here and not above so the fetch-and-store continues and can be
				// returned by future uses of loadExperimentAssignment.
				const fetchedExperimentAssignment = await Timing.timeoutPromise(
					experimentNameToWrappedExperimentAssignmentFetchAndStore[ experimentName ](),
					EXPERIMENT_FETCH_TIMEOUT
				);
				if ( ! fetchedExperimentAssignment ) {
					throw new Error( `Could not fetch ExperimentAssignment` );
				}

				return fetchedExperimentAssignment;
			} catch ( initialError ) {
				safeLogError( {
					message: initialError.message,
					experimentName,
					source: 'loadExperimentAssignment-initialError',
				} );
				if ( config.isDevelopmentMode ) {
					throw initialError;
				}
			}

			// Fetching failed and we're not in development mode.
			try {
				// We provide stale ExperimentAssignments, important for offline users.
				const storedExperimentAssignment = experimentAssignmentStore.retrieve( experimentName );
				if ( storedExperimentAssignment ) {
					return storedExperimentAssignment;
				}

				// We are syncronously trying to retrieve and then store a fallback which means this fallback will
				// be retrieved by all other loadExperimentAssignments that are currently running or will run,
				// preventing a run on the server.
				const fallbackExperimentAssignment = createFallbackExperimentAssignment( experimentName );
				experimentAssignmentStore.store( fallbackExperimentAssignment );
				return fallbackExperimentAssignment;
			} catch ( fallbackError ) {
				safeLogError( {
					message: fallbackError.message,
					experimentName,
					source: 'loadExperimentAssignment-fallbackError',
				} );

				// As a last resort we just keep it very simple
				return createFallbackExperimentAssignment( experimentName );
			}
		},
		dangerouslyGetExperimentAssignment: ( experimentName: string ): ExperimentAssignment => {
			if ( ! Validation.isName( experimentName ) ) {
				throw new Error( `Invalid experimentName: ${ experimentName }` );
			}

			const storedExperimentAssignment = experimentAssignmentStore.retrieve( experimentName );
			if ( ! storedExperimentAssignment ) {
				throw new MissingExperimentAssignmentError(
					`Trying to dangerously get an ExperimentAssignment that hasn't loaded.`
				);
			}

			// We want to be loud in development mode to help pick up any issues:
			if ( config.isDevelopmentMode ) {
				// Highlight when we dangerously get an experiment too soon to when we load one:
				if (
					storedExperimentAssignment &&
					Timing.monotonicNow() - storedExperimentAssignment.retrievedTimestamp < 1000
				) {
					throw new Error(
						`Warning: Trying to dangerously get an ExperimentAssignment too soon after loading it.`
					);
				}
			}

			return storedExperimentAssignment;
		},
		config,
	};
}

/**
 * A dummy ExPlat client to sub in under SSR contexts
 *
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
		config,
	};
}
