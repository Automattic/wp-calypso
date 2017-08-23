/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	OAUTH2_CLIENT_DATA_REQUEST,
	OAUTH2_CLIENT_DATA_REQUEST_SUCCESS,
	OAUTH2_CLIENT_SIGNUP_URL_REQUEST_SUCCESS,
	ROUTE_SET,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import reducer, {
	clients,
	currentClientId,
	initialClientsData,
} from '../reducer';

describe( 'reducer', () => {
	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'clients',
			'currentClientId',
		] );
	} );

	describe( 'clients', () => {
		const testState = {
			930: {
				id: 930,
				name: 'vaultpress',
				title: 'Vaultpress',
				icon: 'https://vaultpress.com/images/vaultpress-wpcc-nav-2x.png',
			},
			973: {
				id: 973,
				name: 'akismet',
				title: 'Akismet',
				icon: 'https://akismet.com/img/akismet-wpcc-logo-2x.png',
			}
		};

		it( 'should default to a non empty object', () => {
			const state = clients( undefined, {} );

			expect( state ).to.be.an( 'object' ).that.is.not.empty;
		} );

		it( 'should keep using stale client data when a fetch request for this client id is emitted', () => {
			const state = clients( testState, {
				type: OAUTH2_CLIENT_DATA_REQUEST,
				clientId: 930
			} );

			expect( state ).to.deep.equal( testState );
		} );

		it( 'should update the client data from the list of clients on response from the server', () => {
			const state = clients( testState, {
				type: OAUTH2_CLIENT_DATA_REQUEST_SUCCESS,
				data: {
					id: 930,
					name: 'vaultpress2',
					title: 'Vaultpress 2',
					icon: 'https://vaultpress.com/images/vaultpress-wpcc-nav-2x.png',
				}
			} );

			expect( state ).to.deep.equal( {
				930: {
					id: 930,
					name: 'vaultpress2',
					title: 'Vaultpress 2',
					icon: 'https://vaultpress.com/images/vaultpress-wpcc-nav-2x.png',
				},
				973: {
					id: 973,
					name: 'akismet',
					title: 'Akismet',
					icon: 'https://akismet.com/img/akismet-wpcc-logo-2x.png',
				}
			} );
		} );

		it( 'should not persist state', () => {
			const state = clients( undefined, {
				type: SERIALIZE
			} );
			expect( state ).to.deep.equal( initialClientsData );
		} );

		it( 'should not load persisted state', () => {
			const state = clients( undefined, {
				type: DESERIALIZE
			} );
			expect( state ).to.deep.equal( initialClientsData );
		} );

		it( 'should assign signup url to proper client', () => {
			const clientId = 50916;
			const signupUrl = 'https://signup.wordpress.com/signup/?ref=oauth2&oauth2_redirect=' +
			'4ab0ab473870ec49d4f494d5eca57f44%40https%3A%2F%2Fpublic-api.wordpress.com%2Foauth2%2Fauthorize' +
			'%2F%3Fresponse_type%3Dcode%26client_id%3D50916%26state%3D929106ee4827adb383bf5b053741a9c1%26' +
			'redirect_uri%3Dhttps%253A%252F%252Fwoocommerce.com%252Fwc-api%252Fwpcom-signin%253Fnext%253D' +
			'myaccount%26blog_id%3D0%26wpcom_connect%3D1%26jetpack-code%26jetpack-user-id%3D0&wpcom_connect=1';

			const state = clients( {
				[ clientId ]: { }
			}, {
				type: OAUTH2_CLIENT_SIGNUP_URL_REQUEST_SUCCESS,
				signupUrl,
			} );

			expect( state[ clientId ].signupUrl ).to.equal( signupUrl );
		} );
	} );

	describe( 'currentClientId', () => {
		it( 'should default to undefined', () => {
			const state = currentClientId( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should be updated on ROUTE_SET when the route starts with /log-in', () => {
			const state = currentClientId( undefined, {
				type: ROUTE_SET,
				path: '/log-in/fr',
				query: {
					client_id: 42,
					retry: 1,
				},
			} );

			expect( state ).to.equal( 42 );
		} );

		it( 'should not persist state', () => {
			const state = currentClientId( true, {
				type: SERIALIZE
			} );
			expect( state ).to.be.null;
		} );

		it( 'should not load persisted state', () => {
			const state = currentClientId( true, {
				type: DESERIALIZE
			} );
			expect( state ).to.be.null;
		} );
	} );
} );
