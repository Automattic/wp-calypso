import { EDGE_CACHE_ACTIVE_SET } from 'calypso/state/action-types';
import reducer from '../reducer';

describe( 'reducer', () => {
	test( 'should default to an empty object', () => {
		const state = reducer( undefined, {} );

		expect( state ).toEqual( {} );
	} );

	test( 'should update edge cache active setting', () => {
		const previousState = {
			12345678: {
				active: 1,
			},
		};
		const state1 = reducer( previousState, {
			type: EDGE_CACHE_ACTIVE_SET,
			siteId: 9876543,
			active: 0,
		} );

		expect( state1 ).toEqual( {
			12345678: {
				active: 0,
			},
		} );

		const state2 = reducer( previousState, {
			type: EDGE_CACHE_ACTIVE_SET,
			siteId: 9876543,
			active: 0,
		} );

		expect( state2 ).toEqual( {
			12345678: {
				active: 0,
			},
		} );
	} );
} );
