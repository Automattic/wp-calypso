/** @format */

/**
 * Internal dependencies
 */
import { currentFlow } from '../reducer';
import { SIGNUP_CURRENT_FLOW_SET } from 'state/action-types';

describe( 'reducer', () => {
	test( 'should update the current flow', () => {
		expect(
			currentFlow(
				{},
				{
					type: SIGNUP_CURRENT_FLOW_SET,
					flowName: 'hastalavista',
				}
			)
		).toEqual( 'hastalavista' );
	} );
} );
