import * as ExperimentAssignments from './experiment-assignments';
import localStorage from './local-storage';
import { monotonicNow } from './timing';
import { validateExperimentAssignment, isObject } from './validations';
import type { Config, ExperimentAssignment } from '../types';

interface FetchExperimentAssignmentResponse {
	variations: Record< string, unknown >;
	/**
	 * Additive structured sibling to `variations`, keyed by the same experiment
	 * names. Each entry carries the assigned variation's decoded custom `value`
	 * (any JSON type, or `null` for no payload). Optional: older servers omit it
	 * entirely, in which case consumers fall back to `variations` alone.
	 */
	assignments?: Record< string, { value?: unknown } >;
	ttl: number;
}

/**
 * Exported for testing only.
 * @param response The response data
 */
export function isFetchExperimentAssignmentResponse(
	response: unknown
): response is FetchExperimentAssignmentResponse {
	return (
		isObject( response ) &&
		isObject( response.variations ) &&
		// `assignments` is additive and optional — accept its absence, but if it
		// is present it must be an object so we can safely index it.
		( response.assignments === undefined || isObject( response.assignments ) ) &&
		typeof response.ttl === 'number' &&
		0 < response.ttl
	);
}

function validateFetchExperimentAssignmentResponse(
	response: unknown
): FetchExperimentAssignmentResponse {
	if ( isFetchExperimentAssignmentResponse( response ) ) {
		return response;
	}
	throw new Error( 'Invalid FetchExperimentAssignmentResponse' );
}

// We cache the anonId and add it to requests to ensure users that have recently
// crossed the logged-out/logged-in boundry have a consistent assignment.
//
// There can be issues otherwise as matching anonId to userId is only eventually
// consistent.
const localStorageLastAnonIdKey = 'explat-last-anon-id';
const localStorageLastAnonIdRetrievalTimeKey = 'explat-last-anon-id-retrieval-time';
const lastAnonIdExpiryTimeMs = 24 * 60 * 60 * 1000; // 24 hours
/**
 * INTERNAL USE ONLY
 *
 * Runs the getAnonId provided cached by LocalStorage:
 * - Returns the result of getAnonId if it can
 * - Otherwise, within the expiry time, returns the cached anonId
 *
 * Exported for testing.
 * @param getAnonId The getAnonId function
 */
export const localStorageCachedGetAnonId = async ( getAnonId: Config[ 'getAnonId' ] ) => {
	const anonId = await getAnonId();
	if ( anonId ) {
		localStorage.setItem( localStorageLastAnonIdKey, anonId );
		localStorage.setItem( localStorageLastAnonIdRetrievalTimeKey, String( monotonicNow() ) );
		return anonId;
	}

	const maybeStoredAnonId = localStorage.getItem( localStorageLastAnonIdKey );
	const maybeStoredRetrievalTime = localStorage.getItem( localStorageLastAnonIdRetrievalTimeKey );
	if (
		maybeStoredAnonId &&
		maybeStoredRetrievalTime &&
		monotonicNow() - parseInt( maybeStoredRetrievalTime, 10 ) < lastAnonIdExpiryTimeMs
	) {
		return maybeStoredAnonId;
	}

	return null;
};

/**
 * Fetch an ExperimentAssignment
 * @param config The config object providing dependecy injection.
 * @param experimentName The experiment name to fetch
 */
export async function fetchExperimentAssignment(
	config: Config,
	experimentName: string
): Promise< ExperimentAssignment > {
	const retrievedTimestamp = monotonicNow();

	const {
		variations,
		assignments,
		ttl: responseTtl,
	} = validateFetchExperimentAssignmentResponse(
		await config.fetchExperimentAssignment( {
			anonId: await localStorageCachedGetAnonId( config.getAnonId ),
			experimentName,
		} )
	);

	const ttl = Math.max( ExperimentAssignments.minimumTtl, responseTtl );

	const fetchedExperimentAssignments = Object.entries( variations )
		.map( ( [ experimentName, variationName ] ) => {
			// Surface the decoded custom value from the additive `assignments` key
			// when the server provides it. When the key is absent (older server)
			// we leave `variationValue` off entirely so existing consumers and
			// cached assignments are unaffected. A present entry whose `value` is
			// missing collapses to `null` ("no usable value").
			const assignmentEntry = assignments?.[ experimentName ];
			return {
				experimentName,
				variationName,
				retrievedTimestamp,
				ttl,
				...( assignmentEntry ? { variationValue: assignmentEntry.value ?? null } : {} ),
			};
		} )
		.map( validateExperimentAssignment );

	if ( fetchedExperimentAssignments.length > 1 ) {
		throw new Error(
			'Received multiple experiment assignments while trying to fetch exactly one.'
		);
	}

	if ( fetchedExperimentAssignments.length === 0 ) {
		return ExperimentAssignments.createFallbackExperimentAssignment( experimentName, ttl );
	}

	const fetchedExperimentAssignment = fetchedExperimentAssignments[ 0 ];

	if ( fetchedExperimentAssignment.experimentName !== experimentName ) {
		throw new Error(
			"Newly fetched ExperimentAssignment's experiment name does not match request."
		);
	}

	if ( ! ExperimentAssignments.isAlive( fetchedExperimentAssignment ) ) {
		throw new Error( "Newly fetched experiment isn't alive." );
	}

	return fetchedExperimentAssignment;
}
