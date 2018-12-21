/** @format */

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { SIGNUP_CURRENT_FLOW_DETAILS_SET } from 'state/action-types';

describe( 'reducer', () => {
	test( 'should update the current flow', () => {
		expect(
			reducer(
				{},
				{
					type: SIGNUP_CURRENT_FLOW_DETAILS_SET,
					name: 'hastalavista',
					step: 'baby',
				}
			)
		).toEqual( {
			name: 'hastalavista',
			step: 'baby',
		} );
	} );
} );
