/**
 * External dependencies
 */
import keys from 'lodash/keys';
import intersection from 'lodash/intersection';
import isEmpty from 'lodash/isEmpty';

/**
 * Internal dependencies
 */
import flows from '../flows';
import steps from '../steps';

describe( 'signup/config', () => {
	it( 'should not have overlapping step/flow names', () => {
		const overlappingNames = intersection( keys( steps ), keys( flows.getFlows() ) );

		if ( ! isEmpty( overlappingNames ) ) {
			throw new Error( 'Step and flow names must be unique. The following names are used as both step and flow names: [' +
				overlappingNames + '].' );
		}
	} );
} );
