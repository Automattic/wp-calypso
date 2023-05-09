import { ROUTE_SET } from 'calypso/state/action-types';
import reducer, { currentClientId } from '../reducer';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'currentClientId' ] )
		);
	} );

	describe( 'currentClientId', () => {
		test( 'should default to undefined', () => {
			const state = currentClientId( undefined, {} );

			expect( state ).toBeNull();
		} );

		test( 'should be updated on ROUTE_SET when the route starts with /log-in', () => {
			const state = currentClientId( undefined, {
				type: ROUTE_SET,
				path: '/log-in/fr',
				query: {
					client_id: 42,
					retry: 1,
				},
			} );

			expect( state ).toEqual( 42 );
		} );
	} );
} );
