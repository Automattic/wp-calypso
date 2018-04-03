/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { reducer } from '../reducer';
import {
	DESERIALIZE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
	SERIALIZE,
} from 'state/action-types';

describe( 'reducer', () => {
	describe( 'credentials', () => {
		const siteCredentials = {
			token: 'abcd1234',
			siteUrl: 'http://yourgroovydomain.com/',
			userEmail: 'somebody@yourgroovydomain.com',
		};

		test( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should index credentials by siteId', () => {
			const siteId = 12345678;
			const initialState = deepFreeze( {} );
			const state = reducer( initialState, {
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
			const state = reducer( initialState, {
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
			const state = reducer( initialState, {
				type: JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
				siteId,
				credentials: newCredentials,
			} );

			expect( state ).toEqual( {
				...initialState,
				[ siteId ]: newCredentials,
			} );
		} );

		test( 'should remove credentials when site connects successfully', () => {
			const siteId = 12345678;
			const original = deepFreeze( {
				[ siteId ]: siteCredentials,
			} );
			const state = reducer( original, {
				type: JETPACK_CONNECT_AUTHORIZE_RECEIVE,
				siteId,
			} );

			expect( state ).toEqual( {} );
		} );

		test( 'should persist state', () => {
			const original = deepFreeze( {
				[ 12345678 ]: siteCredentials,
			} );
			const state = reducer( original, { type: SERIALIZE } );

			expect( state ).toEqual( original );
		} );

		test( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				[ 12345678 ]: siteCredentials,
			} );

			const state = reducer( original, { type: DESERIALIZE } );

			expect( state ).toEqual( original );
		} );

		test( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				[ 12345678 ]: {
					...siteCredentials,
					token: {},
				},
			} );
			const state = reducer( original, { type: DESERIALIZE } );

			expect( state ).toEqual( {} );
		} );
	} );
} );
