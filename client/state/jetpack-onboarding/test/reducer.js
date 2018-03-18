/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { credentialsReducer, settingsReducer } from '../reducer';
import {
	DESERIALIZE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
	JETPACK_ONBOARDING_SETTINGS_UPDATE,
	SERIALIZE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( sandbox => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should export expected reducer keys', () => {
		const state = reducer( undefined, {} );

		expect( state ).toHaveProperty( 'credentials' );
		expect( state ).toHaveProperty( 'settings' );
	} );

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

		test( 'should remove credentials when site connects successfully', () => {
			const siteId = 12345678;
			const original = deepFreeze( {
				[ siteId ]: siteCredentials,
			} );
			const state = credentialsReducer( original, {
				type: JETPACK_CONNECT_AUTHORIZE_RECEIVE,
				siteId,
			} );

			expect( state ).toEqual( {} );
		} );

		test( 'should persist state', () => {
			const original = deepFreeze( {
				[ 12345678 ]: siteCredentials,
			} );
			const state = credentialsReducer( original, { type: SERIALIZE } );

			expect( state ).toEqual( original );
		} );

		test( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				[ 12345678 ]: siteCredentials,
			} );

			const state = credentialsReducer( original, { type: DESERIALIZE } );

			expect( state ).toEqual( original );
		} );

		test( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				[ 12345678 ]: {
					...siteCredentials,
					token: {},
				},
			} );
			const state = credentialsReducer( original, { type: DESERIALIZE } );

			expect( state ).toEqual( {} );
		} );
	} );

	describe( 'settings', () => {
		const settings = {
			onboarding: {
				siteTitle: 'My awesome site',
				siteDescription: 'Not just another amazing WordPress site',
			},
		};

		test( 'should default to an empty object', () => {
			const state = settingsReducer( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should index settings by siteId', () => {
			const siteId = 12345678;
			const initialState = deepFreeze( {} );
			const state = settingsReducer( initialState, {
				type: JETPACK_ONBOARDING_SETTINGS_UPDATE,
				siteId,
				settings,
			} );

			expect( state ).toEqual( {
				[ siteId ]: settings,
			} );
		} );

		test( 'should store settings for new sites', () => {
			const siteId = 87654321;
			const initialState = deepFreeze( {
				[ 12345678 ]: settings,
			} );
			const state = settingsReducer( initialState, {
				type: JETPACK_ONBOARDING_SETTINGS_UPDATE,
				siteId,
				settings,
			} );

			expect( state ).toEqual( {
				...initialState,
				[ siteId ]: settings,
			} );
		} );

		test( 'should add new settings for existing sites', () => {
			const siteId = 12345678;
			const newSettings = {
				onboarding: {
					...settings.onboarding,
					siteType: 'business',
				},
			};
			const initialState = deepFreeze( {
				[ siteId ]: settings,
				[ 87654321 ]: settings,
			} );
			const state = settingsReducer( initialState, {
				type: JETPACK_ONBOARDING_SETTINGS_UPDATE,
				siteId,
				settings: newSettings,
			} );

			expect( state ).toEqual( {
				...initialState,
				[ siteId ]: newSettings,
			} );
		} );

		test( 'should keep non-updated settings for sites', () => {
			const siteId = 12345678;
			const newSettings = {
				onboarding: {
					...settings.onboarding,
					siteDescription: 'A new description',
				},
			};

			const initialState = deepFreeze( {
				[ siteId ]: settings,
				[ 87654321 ]: settings,
			} );
			const state = settingsReducer( initialState, {
				type: JETPACK_ONBOARDING_SETTINGS_UPDATE,
				siteId,
				settings: newSettings,
			} );

			expect( state ).toEqual( {
				...initialState,
				[ siteId ]: newSettings,
			} );
		} );

		test( 'should persist state', () => {
			const original = deepFreeze( {
				[ 12345678 ]: settings,
			} );
			const state = settingsReducer( original, { type: SERIALIZE } );

			expect( state ).toEqual( original );
		} );

		test( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				[ 12345678 ]: settings,
			} );

			const state = settingsReducer( original, { type: DESERIALIZE } );

			expect( state ).toEqual( original );
		} );

		test( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				[ 12345678 ]: {
					onboarding: {
						...settings.onboarding,
						siteTitle: {},
					},
				},
			} );
			const state = settingsReducer( original, { type: DESERIALIZE } );

			expect( state ).toEqual( {} );
		} );
	} );
} );
