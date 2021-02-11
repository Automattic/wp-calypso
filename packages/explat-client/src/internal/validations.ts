/**
 * Internal dependencies
 */
import type { ExperimentAssignment } from '../types';

export function isObject( x: unknown ): x is Record< string, unknown > {
	return typeof x === 'object' && x !== null;
}

const nameRegex = new RegExp( '^[a-z][a-z0-9_]*[a-z0-9]$' );

/**
 * Test if a piece of data is a valid name
 *
 * @param name The data to test
 */
export function isName( name: unknown ): name is string {
	return typeof name === 'string' && nameRegex.test( name );
}

/**
 * Test if a piece of data is a valid experimentAssignment
 *
 * @param experimentAssignment The data to test
 */
export function isExperimentAssignment(
	experimentAssignment: unknown
): experimentAssignment is ExperimentAssignment {
	return (
		isObject( experimentAssignment ) &&
		isName( experimentAssignment[ 'experimentName' ] ) &&
		( isName( experimentAssignment[ 'variationName' ] ) ||
			experimentAssignment[ 'variationName' ] === null ) &&
		typeof experimentAssignment[ 'retrievedTimestamp' ] === 'number' &&
		typeof experimentAssignment[ 'ttl' ] === 'number' &&
		experimentAssignment[ 'ttl' ] !== 0
	);
}

/**
 * Basic validation of ExperimentAssignment
 * Throws if invalid, returns the experimentAssignment if valid.
 *
 * @param experimentAssignment The data to validate
 */
export function validateExperimentAssignment(
	experimentAssignment: unknown
): ExperimentAssignment {
	if ( ! isExperimentAssignment( experimentAssignment ) ) {
		throw new Error( 'Invalid ExperimentAssignment' );
	}

	return experimentAssignment;
}
