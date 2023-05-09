import { SIGNUP_CURRENT_FLOW_NAME_SET } from 'calypso/state/action-types';
import { currentFlowName } from '../reducer';

describe( 'reducer', () => {
	test( 'should update the current flow', () => {
		expect(
			currentFlowName(
				{},
				{
					type: SIGNUP_CURRENT_FLOW_NAME_SET,
					flowName: 'hastalavista',
				}
			)
		).toEqual( 'hastalavista' );
	} );
} );
