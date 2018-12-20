/** @format */

/**
 * Internal dependencies
 */
import { setCurrentFlowName } from '../actions';
import { SIGNUP_CURRENT_FLOW_NAME_SET } from 'state/action-types';

describe( 'setCurrentFlowName()', () => {
	test( 'should return the expected action object', () => {
		const flowName = 'besties4eva';

		expect( setCurrentFlowName( flowName ) ).toEqual( {
			type: SIGNUP_CURRENT_FLOW_NAME_SET,
			flowName,
		} );
	} );
} );
