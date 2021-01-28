/**
 * Internal dependencies
 */
import { Config, ExperimentAssignment } from '../types';
import { validateExperimentAssignment } from './validations';
import { monotonicNow } from './timing';
import { isObject } from './validations';
import * as ExperimentAssignments from './experiment-assignments';

interface FetchExperimentAssignmentResponse {
	variations: Record< string, unknown >;
	ttl: number;
}

function isFetchExperimentAssignmentResponse(
	response: unknown
): response is FetchExperimentAssignmentResponse {
	return (
		isObject( response ) && isObject( response.variations ) && typeof response.ttl === 'number'
	);
}

function validateFetchExperimentAssignmentResponse(
	response: unknown
): FetchExperimentAssignmentResponse {
	if ( isFetchExperimentAssignmentResponse( response ) ) {
		return response;
	}
	throw new Error( 'Invalide FetchExperimentAssignmentResponse' );
}

export async function fetchExperimentAssignment(
	config: Config,
	experimentName: string
): Promise< ExperimentAssignment > {
	const retrievedTimestamp = monotonicNow();

	const { variations, ttl } = validateFetchExperimentAssignmentResponse(
		await config.fetchExperimentAssignment( {
			anonId: ( await config.getAnonId() ) ?? undefined,
			experimentName,
		} )
	);

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
		throw new Error( 'Received no experiment assignments while trying to fetch exactly one.' );
	}

	const fetchedExperimentAssignment = fetchedExperimentAssignments[ 0 ];

	if ( fetchedExperimentAssignment.experimentName !== experimentName ) {
		throw new Error(
			`Newly fetched ExperimentAssignment's experiment name does not match request.`
		);
	}

	if ( ! ExperimentAssignments.isAlive( fetchedExperimentAssignment ) ) {
		throw new Error( `Newly fetched experiment isn't alive, something must be wrong.` );
	}

	return fetchedExperimentAssignment;
}
