/** @format */

/**
 * Internal dependencies
 */
import { setCurrentFlowDetails } from '../actions';
import { SIGNUP_CURRENT_FLOW_DETAILS_SET } from 'state/action-types';

describe( 'setCurrentFlowDetails()', () => {
	test( 'should return the expected action object', () => {
		const name = 'besties4eva';
		const step = '<3';

		expect( setCurrentFlowDetails( { name, step } ) ).toEqual( {
			type: SIGNUP_CURRENT_FLOW_DETAILS_SET,
			name,
			step,
		} );
	} );
} );
