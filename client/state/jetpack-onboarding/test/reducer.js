/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { credentialsReducer } from '../reducer';
import { JETPACK_ONBOARDING_CREDENTIALS_RECEIVE } from 'state/action-types';

describe( 'reducer', () => {
	describe( 'credentials', () => {
		const siteCredentials = {
			token: 'abcd1234',
			siteUrl: 'http://yourgroovydomain.com/',
			userEmail: 'somebody@yourgroovydomain.com',
		};

		test( 'should default to an empty object', () => {
			const state = credentialsReducer( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should index credentials by siteId', () => {
			const siteId = 12345678;
			const initialState = deepFreeze( {} );
			const state = credentialsReducer( initialState, {
				type: JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
				siteId,
				credentials: siteCredentials,
			} );

			expect( state ).toEqual( {
				[ siteId ]: siteCredentials,
			} );
		} );

		test( 'should store credentials for new sites', () => {
			const siteId = 87654321;
			const initialState = deepFreeze( {
				[ 12345678 ]: siteCredentials,
			} );
			const state = credentialsReducer( initialState, {
				type: JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
				siteId,
				credentials: siteCredentials,
			} );

			expect( state ).toEqual( {
				...initialState,
				[ siteId ]: siteCredentials,
			} );
		} );

		test( 'should update credentials for the particular site', () => {
			const siteId = 12345678;
			const newCredentials = {
				...siteCredentials,
				token: 'efgh5678',
			};
			const initialState = deepFreeze( {
				[ siteId ]: siteCredentials,
				[ 87654321 ]: siteCredentials,
			} );
			const state = credentialsReducer( initialState, {
				type: JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
				siteId,
				credentials: newCredentials,
			} );

			expect( state ).toEqual( {
				...initialState,
				[ siteId ]: newCredentials,
			} );
		} );
	} );
} );
