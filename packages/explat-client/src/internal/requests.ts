/**
 * Internal dependencies
 */
import type { Config, ExperimentAssignment } from '../types';
import { validateExperimentAssignment } from './validations';
import { monotonicNow } from './timing';
import { isObject } from './validations';
import * as ExperimentAssignments from './experiment-assignments';
import localStorage from './local-storage';

interface FetchExperimentAssignmentResponse {
	variations: Record< string, unknown >;
	ttl: number;
}

/**
 * Exported for testing only.
 *
 * @param response The response data
 */
export function isFetchExperimentAssignmentResponse(
	response: unknown
): response is FetchExperimentAssignmentResponse {
	return (
		isObject( response ) &&
		isObject( response.variations ) &&
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

// As ExPlat prefers to assign based on anonId and things end up simplest if we can keep the same anonId
// the whole time, we store the first anonId we see in LocalStorage and reuse it:
const localStorageAnonIdKey = 'explat-first-anon-id';
/**
 * INTERNAL USE ONLY
 * Runs the getAnonId provided memoized by LocalStorage, that is it returns the first anonId
 * encountered without re-running getAnonId.
 * Exported for testing.
 *
 * @param getAnonId The getAnonId function
 */
export const localStorageMemoizedGetAnonId = async ( getAnonId: Config[ 'getAnonId' ] ) => {
	const maybeStoredAnonId = localStorage.getItem( localStorageAnonIdKey );
	if ( maybeStoredAnonId ) {
		return maybeStoredAnonId;
	}

	const anonId = await getAnonId();
	if ( anonId ) {
		localStorage.setItem( localStorageAnonIdKey, anonId );
	}
	return anonId;
};

/**
 * Fetch an ExperimentAssignment
 *
 * @param config The config object providing dependecy injection.
 * @param experimentName The experiment name to fetch
 */
export async function fetchExperimentAssignment(
	config: Config,
	experimentName: string
): Promise< ExperimentAssignment > {
	const retrievedTimestamp = monotonicNow();

	const { variations, ttl: responseTtl } = validateFetchExperimentAssignmentResponse(
		await config.fetchExperimentAssignment( {
			anonId: await localStorageMemoizedGetAnonId( config.getAnonId ),
			experimentName,
		} )
	);

	const ttl = Math.max( ExperimentAssignments.minimumTtl, responseTtl );

	const fetchedExperimentAssignments = Object.entries( variations )
		.map( ( [ experimentName, variationName ] ) => ( {
			experimentName,
			variationName,
			retrievedTimestamp,
			ttl,
		} ) )
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
			`Newly fetched ExperimentAssignment's experiment name does not match request.`
		);
	}

	if ( ! ExperimentAssignments.isAlive( fetchedExperimentAssignment ) ) {
		throw new Error( `Newly fetched experiment isn't alive.` );
	}

	return fetchedExperimentAssignment;
}
