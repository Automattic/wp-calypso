/**
 * Internal dependencies
 */
import { ExperimentAssignment, Config } from './types';
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
}

/**
 * Create an ExPlat Client
 *
 * @param config Configuration object
 */
export default function createExPlatClient( config: Config ): ExPlatClient {
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
	 * We have a Async One At A Time (AOAAT) ExperimentAssignment fetch for each experiment (memoization over createAOAATExperimentAssignmentFetch).
	 * This allows multiple calls to occur with only one request behind them.
	 *
	 * @param experimentName The experiment's name
	 */
	const createAOAATExperimentAssignmentFetchAndStore = ( experimentName: string ) =>
		Timing.asyncOneAtATime( async () => {
			const fetchedExperimentAssignment = await Request.fetchExperimentAssignment(
				config.makeRequest,
				experimentName,
				config.getAnonId()
			);
			State.storeExperimentAssignment( fetchedExperimentAssignment );
			return fetchedExperimentAssignment;
		} );
	const experimentNameToAOAATExperimentAssignmentFetchAndStore: Record<
		string,
		ReturnType< typeof createAOAATExperimentAssignmentFetchAndStore >
	> = {};

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

				if (
					experimentNameToAOAATExperimentAssignmentFetchAndStore[ experimentName ] === undefined
				) {
					experimentNameToAOAATExperimentAssignmentFetchAndStore[
						experimentName
					] = createAOAATExperimentAssignmentFetchAndStore( experimentName );
				}
				// TODO: Move timeout within AOAAT
				const fetchedExperimentAssignment = await Timing.timeoutPromise(
					experimentNameToAOAATExperimentAssignmentFetchAndStore[ experimentName ](),
					EXPERIMENT_FETCH_TIMEOUT
				);
				if ( ! fetchedExperimentAssignment ) {
					return createNullExperimentAssignment();
				}

				return fetchedExperimentAssignment;
			} catch ( e ) {
				if ( config.isDevelopmentMode ) {
					throw e;
				} else {
					config.logError( e.message );
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
				throw new Error(
					`Trying to dangerously get an ExperimentAssignment that hasn't loaded, are you sure you have loaded this experiment?`
				);
			}

			if (
				storedExperimentAssignment &&
				! ExperimentAssignments.isAlive( storedExperimentAssignment )
			) {
				if ( config.isDevelopmentMode ) {
					throw new Error(
						`Trying to dangerously get an ExperimentAssignment that has loaded but has since expired`
					);
				} else {
					config.logError(
						`Dangerously getting an ExperimentAssignment that has loaded but has since expired.`
					);
				}
			}

			return storedExperimentAssignment;
		},
	};
}
