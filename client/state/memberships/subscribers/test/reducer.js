import deepFreeze from 'deep-freeze';
import { MEMBERSHIPS_SUBSCRIPTION_STOP_SUCCESS } from '../../../action-types';
import reducer from '../reducer';

describe( 'reducer', () => {
	test( 'preserves pagination and subscription IDs after cancellation', () => {
		const initialState = deepFreeze( {
			list: {
				1: {
					total: 5,
					ownerships: {
						101: { id: '101', amount: 100 },
						202: { id: '202', amount: 200 },
					},
				},
			},
		} );
		const afterCancellation = reducer( initialState, {
			type: MEMBERSHIPS_SUBSCRIPTION_STOP_SUCCESS,
			siteId: 1,
			subscriptionId: '101',
		} );

		expect( afterCancellation.list[ 1 ] ).toEqual( {
			total: 4,
			ownerships: { 202: initialState.list[ 1 ].ownerships[ 202 ] },
		} );
	} );
} );
