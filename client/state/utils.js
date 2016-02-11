/**
 * External dependencies
 */
import tv4 from 'tv4';

/**
 * Internal dependencies
 */
import warn from 'lib/warn';

/**
 * Module variables
 */

export function isValidStateWithSchema( state, schema, checkForCycles = false, banUnknownProperties = false ) {
	const result = tv4.validateResult( state, schema, checkForCycles, banUnknownProperties );
	if ( ! result.valid ) {
		warn( 'state validation failed', state, result.error );
	}
	return result.valid;
}
