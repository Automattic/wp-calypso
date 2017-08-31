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
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import reducer, { initialClientsData } from '../reducer';

describe( 'reducer', () => {
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
		const state = reducer( undefined, {} );

		expect( state ).to.be.an( 'object' ).that.is.not.empty;
	} );

	it( 'should keep using stale client data when a fetch request for this client id is emitted', () => {
		const state = reducer( testState, {
			type: OAUTH2_CLIENT_DATA_REQUEST,
			clientId: 930
		} );

		expect( state ).to.deep.equal( testState );
	} );

	it( 'should update the client data from the list of clients on response from the server', () => {
		const state = reducer( testState, {
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
		const state = reducer( undefined, {
			type: SERIALIZE
		} );
		expect( state ).to.deep.equal( initialClientsData );
	} );

	it( 'should not load persisted state', () => {
		const state = reducer( undefined, {
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

		const state = reducer( {
			[ clientId ]: {}
		}, {
			type: OAUTH2_CLIENT_SIGNUP_URL_REQUEST_SUCCESS,
			signupUrl,
		} );

		expect( state[ clientId ].signupUrl ).to.equal( signupUrl );
	} );
} );
