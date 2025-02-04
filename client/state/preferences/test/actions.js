import {
	PREFERENCES_RECEIVE,
	PREFERENCES_FETCH,
	PREFERENCES_FETCH_FAILURE,
	PREFERENCES_FETCH_SUCCESS,
	PREFERENCES_SET,
	PREFERENCES_SAVE_SUCCESS,
} from 'calypso/state/action-types';
import useNock from 'calypso/test-helpers/use-nock';
import { receivePreferences, fetchPreferences, savePreference, setPreference } from '../actions';
import { DEFAULT_PREFERENCE_VALUES, USER_SETTING_KEY } from '../constants';

describe( 'actions', () => {
	let spy;

	beforeEach( () => {
		spy = jest.fn();
	} );

	const responseShape = {
		[ USER_SETTING_KEY ]: DEFAULT_PREFERENCE_VALUES,
	};

	describe( 'receivePreferences()', () => {
		test( 'should return an action object', () => {
			const action = receivePreferences( { foo: 'bar' } );

			expect( action ).toEqual( {
				type: PREFERENCES_RECEIVE,
				values: {
					foo: 'bar',
				},
			} );
		} );
	} );

	describe( 'fetchPreferences()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/me/preferences' )
				.reply( 200, responseShape );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			fetchPreferences()( spy );
			expect( spy ).toHaveBeenCalledWith( {
				type: PREFERENCES_FETCH,
			} );
		} );

		test( 'should dispatch PREFERENCES_RECEIVE when request completes', () => {
			return fetchPreferences()( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith(
					expect.objectContaining( {
						type: PREFERENCES_RECEIVE,
						values: responseShape[ USER_SETTING_KEY ],
					} )
				);
			} );
		} );

		test( 'should dispatch success action when request completes', () => {
			return fetchPreferences()( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith(
					expect.objectContaining( {
						type: PREFERENCES_FETCH_SUCCESS,
					} )
				);
			} );
		} );
	} );

	describe( 'fetchPreferences() with error', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/me/preferences' )
				.reply( 404 );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return fetchPreferences()( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith(
					expect.objectContaining( {
						type: PREFERENCES_FETCH_FAILURE,
					} )
				);
			} );
		} );
	} );

	describe( 'setPreference()', () => {
		test( 'should return PREFERENCES_SET with correct payload', () => {
			expect( setPreference( 'preferenceKey', 'preferenceValue' ) ).toEqual( {
				type: PREFERENCES_SET,
				key: 'preferenceKey',
				value: 'preferenceValue',
			} );
		} );
	} );

	describe( 'savePreference()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/me/preferences', {
					[ USER_SETTING_KEY ]: { preferenceKey: 'preferenceValue' },
				} )
				.reply( 200, responseShape );

			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/me/preferences', {
					[ USER_SETTING_KEY ]: { loggedOut: true },
				} )
				.reply( 403, {
					error: 'authorization_required',
					message:
						'An active access token must be used to query information about the current user.',
				} );
		} );

		test( 'should dispatch PREFERENCES_SET action when thunk triggered', () => {
			savePreference( 'preferenceKey', 'preferenceValue' )( spy );
			expect( spy ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: PREFERENCES_SET,
					key: 'preferenceKey',
					value: 'preferenceValue',
				} )
			);
		} );

		test( 'should dispatch PREFERENCES_RECEIVE action when request completes', () => {
			return savePreference(
				'preferenceKey',
				'preferenceValue'
			)( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith(
					expect.objectContaining( {
						type: PREFERENCES_RECEIVE,
						values: responseShape[ USER_SETTING_KEY ],
					} )
				);
			} );
		} );

		test( 'should dispatch PREFERENCES_SAVE_SUCCESS action when request completes', () => {
			return savePreference(
				'preferenceKey',
				'preferenceValue'
			)( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith(
					expect.objectContaining( {
						type: PREFERENCES_SAVE_SUCCESS,
						key: 'preferenceKey',
						value: 'preferenceValue',
					} )
				);
			} );
		} );
	} );
} );
