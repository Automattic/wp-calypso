/**
 * Internal dependencies
 */
import { currentFlowName } from '../reducer';
import { SIGNUP_CURRENT_FLOW_NAME_SET } from 'calypso/state/action-types';

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
