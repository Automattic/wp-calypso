require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
const keys = require( 'lodash/object/keys' ),
	intersection = require( 'lodash/array/intersection' ),
	isEmpty = require( 'lodash/lang/isEmpty' );

/**
 * Internal dependencies
 */
const flows = require( '../flows' ),
	steps = require( '../steps' );

describe( 'signup/config', () => {
	it( 'should not have overlapping step/flow names', () => {
		const overlappingNames = intersection( keys( steps ), keys( flows.getFlows() ) );

		if ( ! isEmpty( overlappingNames ) ) {
			throw new Error( 'Step and flow names must be unique. The following names are used as both step and flow names: [' +
				overlappingNames + '].' );
		}
	} );
} );
