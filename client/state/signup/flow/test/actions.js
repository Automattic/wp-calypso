/** @format */

/**
 * Internal dependencies
 */
import { setCurrentFlow } from '../actions';
import { SIGNUP_CURRENT_FLOW_SET } from 'state/action-types';

describe( 'setCurrentFlow()', () => {
	test( 'should return the expected action object', () => {
		const flowName = 'besties4eva';

		expect( setCurrentFlow( flowName ) ).toEqual( {
			type: SIGNUP_CURRENT_FLOW_SET,
			flowName,
		} );
	} );
} );
