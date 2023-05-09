import { SIGNUP_CURRENT_FLOW_NAME_SET } from 'calypso/state/action-types';
import { setCurrentFlowName } from '../actions';

describe( 'setCurrentFlowName()', () => {
	test( 'should return the expected action object', () => {
		const flowName = 'besties4eva';

		expect( setCurrentFlowName( flowName ) ).toEqual( {
			type: SIGNUP_CURRENT_FLOW_NAME_SET,
			flowName,
		} );
	} );
} );
