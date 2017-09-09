/**
 * External dependencies
 */
import { expect } from 'chai';
import { pick } from 'lodash';

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
	// Uses default data but reduces the size of this data set for tests
	const initialState = pick( initialClientsData, [ 930, 973 ] );

	it( 'should throw an error when no parameter is provided', () => {
		expect( () => reducer() ).to.throw( TypeError );
	} );

	it( 'should throw an error when no action is provided', () => {
		expect( () => reducer( {} ) ).to.throw( TypeError );
	} );

	it( 'should return the current state for an empty action', () => {
		const newState = reducer( initialState, {} );

		expect( newState ).to.be.eql( initialState );
	} );

	it( 'should return the current state for an unknown action type', () => {
		const newState = reducer( initialState, { type: 'BUY_BURGER', } );

		expect( newState ).to.be.eql( initialState );
	} );

	it( 'should return the current state when fetching client data starts', () => {
		const newState = reducer( initialState, {
			type: OAUTH2_CLIENT_DATA_REQUEST,
			clientId: 930
		} );

		expect( newState ).to.deep.equal( initialState );
	} );

	it( 'should return updated state with updated data when client data was fetched successful', () => {
		const newState = reducer( initialState, {
			type: OAUTH2_CLIENT_DATA_REQUEST_SUCCESS,
			data: {
				id: 930,
				title: 'Vaultpress Pro',
				url: 'https://vaultpress.pro/'
			}
		} );

		expect( newState ).to.deep.equal( {
			930: {
				id: 930,
				name: 'vaultpress',
				title: 'Vaultpress Pro',
				icon: 'https://vaultpress.com/images/vaultpress-wpcc-nav-2x.png',
				url: 'https://vaultpress.pro/'
			},
			973: {
				id: 973,
				name: 'akismet',
				title: 'Akismet',
				icon: 'https://akismet.com/img/akismet-wpcc-logo-2x.png',
			}
		} );
	} );

	it( 'should return updated state with new data when client data was fetched successful', () => {
		const newState = reducer( initialState, {
			type: OAUTH2_CLIENT_DATA_REQUEST_SUCCESS,
			data: {
				id: 2665,
				title: 'IntenseDebate',
				url: 'https://intensedebate.com/',
				icon: 'https://i0.wp.com/developer.files.wordpress.com/2013/04/idwp-feature-adminpanel.png?w=100'
			}
		} );

		expect( newState ).to.deep.equal( {
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
			},
			2665: {
				id: 2665,
				title: 'IntenseDebate',
				url: 'https://intensedebate.com/',
				icon: 'https://i0.wp.com/developer.files.wordpress.com/2013/04/idwp-feature-adminpanel.png?w=100'
			}
		} );
	} );

	it( 'should not persist state', () => {
		const newState = reducer( undefined, {
			type: SERIALIZE
		} );

		expect( newState ).to.deep.equal( initialClientsData );
	} );

	it( 'should not load persisted state', () => {
		const newState = reducer( undefined, {
			type: DESERIALIZE
		} );

		expect( newState ).to.deep.equal( initialClientsData );
	} );

	it( 'should assign signup url to proper client', () => {
		const clientId = 50916;
		const signupUrl = 'https://signup.wordpress.com/signup/?ref=oauth2&oauth2_redirect=' +
			'4ab0ab473870ec49d4f494d5eca57f44%40https%3A%2F%2Fpublic-api.wordpress.com%2Foauth2%2Fauthorize' +
			'%2F%3Fresponse_type%3Dcode%26client_id%3D50916%26state%3D929106ee4827adb383bf5b053741a9c1%26' +
			'redirect_uri%3Dhttps%253A%252F%252Fwoocommerce.com%252Fwc-api%252Fwpcom-signin%253Fnext%253D' +
			'myaccount%26blog_id%3D0%26wpcom_connect%3D1%26jetpack-code%26jetpack-user-id%3D0&wpcom_connect=1';

		const newState = reducer( {
			[ clientId ]: {}
		}, {
			type: OAUTH2_CLIENT_SIGNUP_URL_REQUEST_SUCCESS,
			signupUrl,
		} );

		expect( newState[ clientId ].signupUrl ).to.equal( signupUrl );
	} );
} );
