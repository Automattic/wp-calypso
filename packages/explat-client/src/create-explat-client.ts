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
	 * Loads and returns an Experiment Assignment Promise, starting an assignment if necessary.
	 *
	 * Call as many times as you like, it will only make one request at a time and
	 * will only trigger a request when the assignment TTL is expired.
	 * 
	 * Will never throw in production, it will return the default assignment.
	 * It should not be run on the server but it won't crash anything.
	 *
	 * @param experimentName
	 */
	loadExperimentAssignment: ( experimentName: string ) => Promise< ExperimentAssignment >;

	/**
	 * Get an already loaded Experiment Assignment, will throw if there is an error, e.g. if it hasn't been loaded.
	 * 
	 * Make sure loadExperimentAssignment has been called before calling this function.
	 * 
	 */
	dangerouslyGetExperimentAssignment: ( experimentName: string ) => ExperimentAssignment;
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

	/**
	 * We have a Async One At A Time ExperimentAssignment fetch for each experiment (memoization over createAOAATExperimentAssignmentFetch).
	 * This allows multiple calls to occur with only one request behind them.
	 */
	const experimentNameToAOAATExperimentAssignmentFetchAndStore: Record<string, ReturnType<typeof createAOAATExperimentAssignmentFetchAndStore>> = {}
	const createAOAATExperimentAssignmentFetchAndStore = (experimentName) => Timing.asyncOneAtATime( async () => {
		const fetchedExperimentAssignment = await Request.fetchExperimentAssignment(
			makeRequest,
			experimentName,
			getAnonId()
		);
		State.storeExperimentAssignment(fetchedExperimentAssignment);
		return fetchedExperimentAssignment;
	} );


	return {
		loadExperimentAssignment: async ( experimentName: string ): Promise< ExperimentAssignment > => {
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
				if (experimentNameToAOAATExperimentAssignmentFetchAndStore[experimentName] === undefined) {
					experimentNameToAOAATExperimentAssignmentFetchAndStore[experimentName]
						= createAOAATExperimentAssignmentFetchAndStore(experimentName)
				}
				const fetchedExperimentAssignment = await Timing.timeoutPromise(
					experimentNameToAOAATExperimentAssignmentFetchAndStore[experimentName](),
					EXPERIMENT_FETCH_TIMEOUT
				);

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
		dangerouslyGetExperimentAssignment: ( experimentName: string ): ExperimentAssignment => {
			if ( Validation.isName( experimentName ) ) {
				throw new Error( `Invalid experimentName: ${ experimentName }` );
			}

			const storedExperimentAssignment = State.retrieveExperimentAssignment( experimentName );
			if ( ! storedExperimentAssignment ) {
				throw new Error(`Trying to dangerously get an ExperimentAssignment that hasn't loaded, are you sure you have loaded this experiment?`);
			}

			if ( 
				storedExperimentAssignment &&
				! ExperimentAssignments.isAlive( storedExperimentAssignment )
			) {
				if ( isDevelopmentMode ) {
					throw new Error(`Trying to dangerously get an ExperimentAssignment that has loaded but has since expired`);
				} else {
					logError(`Dangerously getting an ExperimentAssignment that has loaded but has since expired.`);
				}
			}

			return storedExperimentAssignment;
		},
	};
}
