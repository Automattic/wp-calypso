import { ExperimentAssignment } from '../types';

function isObject( x: unknown ): x is Record< string, unknown > {
	return typeof x === 'object' && x !== null;
}

/**
 * Test if a piece of data is a valid name
 * @param name
 */
export function isName( name: unknown ): name is string {
	return typeof name === 'string' && name !== '';
}

function isExperimentAssignment(
	experimentAssignment: unknown
): experimentAssignment is ExperimentAssignment {
	return (
		isObject( experimentAssignment ) &&
		isName( experimentAssignment[ 'experimentName' ] ) &&
		isName( experimentAssignment[ 'variationName' ] ) &&
		typeof experimentAssignment[ 'retrievedTimestamp' ] === 'number' &&
		typeof experimentAssignment[ 'ttl' ] === 'number'
	);
}

/**
 * Basic validation of ExperimentAssignment
 *
 * Throws if invalid, returns the experimentAssignment if valid.
 *
 * @param experimentAssignment
 */
export function validateExperimentAssignment(
	experimentAssignment: unknown
): ExperimentAssignment {
	if ( ! isExperimentAssignment( experimentAssignment ) ) {
		throw new Error( 'Invalid ExperimentAssignment' );
	}

	return experimentAssignment;
}
