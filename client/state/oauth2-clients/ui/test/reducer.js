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

		test( 'should store the namespaced key on ROUTE_SET with oauth2_1_client_id', () => {
			const state = currentClientId( undefined, {
				type: ROUTE_SET,
				path: '/log-in',
				query: {
					oauth2_1_client_id: '7',
				},
			} );

			expect( state ).toEqual( 'oauth2-1:7' );
		} );

		test( 'should prefer oauth2_1_client_id over client_id when both are present', () => {
			const state = currentClientId( undefined, {
				type: ROUTE_SET,
				path: '/log-in',
				query: {
					client_id: 42,
					oauth2_1_client_id: '7',
				},
			} );

			expect( state ).toEqual( 'oauth2-1:7' );
		} );

		test( 'should keep the current state when neither client id is present', () => {
			const state = currentClientId( 'oauth2-1:7', {
				type: ROUTE_SET,
				path: '/log-in/link',
				query: {},
			} );

			expect( state ).toEqual( 'oauth2-1:7' );
		} );
	} );
} );
