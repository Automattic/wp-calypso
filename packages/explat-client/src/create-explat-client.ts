import { MakeRequest, GetAnonId, LogError, ExperimentAssignment } from './types';
import * as ExperimentAssignments from './internal/experiment-assignments';
import * as Request from './internal/requests';
import * as State from './internal/state';
import * as Timing from './internal/timing';
import * as Validation from './internal/validations';

/**
 * The number of seconds before we abandon fetching an experiment
 */
const EXPERIMENT_FETCH_TIMEOUT = 5000;

export interface ExPlatClient {
	/**
	 * Get, starting an assignment if necessary, an Experiment Assignment Promise.
	 *
	 * Call as many times as you like, it will only make one request at a time and
	 * will only trigger a request when the assignment TTL is expired.
	 *
	 * @param experimentName
	 */
	getExperimentAssignment: ( experimentName: string ) => Promise< ExperimentAssignment >;
}

/**
 * Create an ExPlat Client
 *
 * @param makeRequest Modelled off of Calypso/state/data-layer/wpcom-http, a simple abstraction over an http request.
 * @param getAnonId
 */
export default function createExPlatClient(
    // TODO: Switch this to an object argument containing these
	makeRequest: MakeRequest,
	getAnonId: GetAnonId,
	logError: LogError,
	isDevelopmentMode: boolean
): ExPlatClient {
	/**
	 * The null experiment assignment we return when we can't retrieve one.
	 */
	const createNullExperimentAssignment = (): ExperimentAssignment => ( {
		experimentName: 'null_experiment_assignment',
		variationName: null,
		retrievedTimestamp: 0,
		ttl: 0,
	} );

	let lastRetrievedAllTimestamp = 0;
	let lastTTLAll = 0;
	/**
	 * This function fetchs or starts assignment on all experiment assignments and returns them as a promise.
	 *
	 * It is wrapped in a asyncOneAtATime so there will only be one instance of it running at a time,
	 * it's return will be shared among the callers.
	 */
	const asyncOAATFetchAllExperimentAssignmentsAndStore = Timing.asyncOneAtATime( async () => {
		// If we have fetched recently enough we don't do anything
		// This is necessary for experiments that don't exist.
		// It can be removed if we move to singular-assignment-fetching
		const now = Timing.monotonicNow();
		if ( now < lastRetrievedAllTimestamp + lastTTLAll * Timing.MILLISECONDS_PER_SECOND ) {
			return null;
		}

		const [ experimentAssignments, ttl ] = await Request.fetchAllExperimentAssignments(
			makeRequest,
			getAnonId()
		);
		lastRetrievedAllTimestamp = now;
		lastTTLAll = ttl;
		experimentAssignments.map( State.storeExperimentAssignment );
		return experimentAssignments;
	} );

	return {
		getExperimentAssignment: async ( experimentName: string ): Promise< ExperimentAssignment > => {
			try {
				if ( Validation.isName( experimentName ) ) {
					throw new Error( `Invalid experimentName: ${ experimentName }` );
				}

				const storedExperimentAssignment = State.retrieveExperimentAssignment( experimentName );
				if (
					storedExperimentAssignment &&
					ExperimentAssignments.isAlive( storedExperimentAssignment )
				) {
					return storedExperimentAssignment;
				}

				// TODO: Don't refetch on global
				const fetchedExperimentAssignments = await Timing.timeoutPromise(
					asyncOAATFetchAllExperimentAssignmentsAndStore(),
					EXPERIMENT_FETCH_TIMEOUT
				);
				const fetchedExperimentAssignment =
					fetchedExperimentAssignments &&
					fetchedExperimentAssignments.find(
						( experimentAssignment ) => experimentAssignment.experimentName === experimentName
					);
				if ( fetchedExperimentAssignment ) {
					if ( ! ExperimentAssignments.isAlive( fetchedExperimentAssignment ) ) {
						throw new Error( `Newly fetched experiment isn't alive, something must be wrong.` );
					}
					return fetchedExperimentAssignment;
				}

				return createNullExperimentAssignment();
			} catch ( e ) {
				if ( isDevelopmentMode ) {
					throw e;
				} else {
					logError( e.message );
				}
				return createNullExperimentAssignment();
			}
		},
	};
}
