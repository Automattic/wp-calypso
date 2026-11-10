import deepFreeze from 'deep-freeze';
import {
	MEMBERSHIPS_SUBSCRIBERS_RECEIVE,
	MEMBERSHIPS_SUBSCRIPTION_STOP_SUCCESS,
} from '../../../action-types';
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
				2: { total: 1, ownerships: { 404: { id: '404', amount: 400 } } },
			},
		} );
		const cancellation = {
			type: MEMBERSHIPS_SUBSCRIPTION_STOP_SUCCESS,
			siteId: 1,
			subscriptionId: '101',
		};

		const afterCancellation = reducer( initialState, cancellation );

		expect( afterCancellation.list[ 1 ] ).toEqual( {
			total: 4,
			ownerships: { 202: initialState.list[ 1 ].ownerships[ 202 ] },
		} );
		expect( Object.keys( afterCancellation.list[ 1 ].ownerships ) ).toEqual( [ '202' ] );
		expect( Object.keys( afterCancellation.list[ 1 ].ownerships ).length ).toBeLessThan(
			afterCancellation.list[ 1 ].total
		);
		expect( initialState.list[ 1 ].total ).toBe( 5 );
		expect( Object.keys( initialState.list[ 1 ].ownerships ) ).toEqual( [ '101', '202' ] );
		expect( afterCancellation.list[ 2 ] ).toBe( initialState.list[ 2 ] );
		expect( reducer( afterCancellation, cancellation ) ).toBe( afterCancellation );
		expect( reducer( afterCancellation, { ...cancellation, siteId: 3 } ) ).toBe(
			afterCancellation
		);

		const updatedSubscription = { id: '202', amount: 250 };
		const newSubscription = { id: '303', amount: 300 };
		const afterNextPage = reducer( afterCancellation, {
			type: MEMBERSHIPS_SUBSCRIBERS_RECEIVE,
			siteId: 1,
			subscribers: { total: 4, ownerships: [ updatedSubscription, newSubscription ] },
		} );

		expect( afterNextPage.list[ 1 ] ).toEqual( {
			total: 4,
			ownerships: { 202: updatedSubscription, 303: newSubscription },
		} );
		expect( Object.keys( afterNextPage.list[ 1 ].ownerships ) ).toEqual( [ '202', '303' ] );
		expect( afterNextPage.list[ 2 ] ).toBe( initialState.list[ 2 ] );
	} );
} );
