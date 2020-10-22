/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import {
	requestUserSettings,
	storeFetchedUserSettings,
	fromApi,
	saveUserSettings,
	finishUserSettingsSave,
} from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { updateUserSettings, clearUnsavedUserSettings } from 'calypso/state/user-settings/actions';

describe( 'wpcom-api', () => {
	describe( 'user settings request', () => {
		describe( '#requestUserSettings', () => {
			test( 'should dispatch HTTP GET request to me/settings endpoint', () => {
				const action = { type: 'DUMMY' };

				expect( requestUserSettings( action ) ).toEqual(
					http(
						{
							apiVersion: '1.1',
							method: 'GET',
							path: '/me/settings',
						},
						action
					)
				);
			} );
		} );

		describe( '#storeFetchedUserSettings', () => {
			test( 'should dispatch user settings update', () => {
				const action = { type: 'DUMMY' };

				const result = storeFetchedUserSettings( action, {
					language: 'qix',
				} );

				expect( result ).toEqual(
					updateUserSettings( {
						language: 'qix',
					} )
				);
			} );

			test( 'should decode HTML entities returned in some fields of HTTP response', () => {
				const action = { type: 'DUMMY' };

				const result = storeFetchedUserSettings(
					action,
					fromApi( {
						display_name: 'baz &amp; qix',
						description: 'foo &amp; bar',
						user_URL: 'http://example.com?a=b&amp;c=d',
					} )
				);

				expect( result ).toEqual(
					updateUserSettings( {
						display_name: 'baz & qix',
						description: 'foo & bar',
						user_URL: 'http://example.com?a=b&c=d',
					} )
				);
			} );
		} );
	} );

	describe( 'user settings save', () => {
		describe( '#saveUserSettings', () => {
			test( 'should dispatch POST request to me/settings using unsavedSettings from state', () => {
				const dispatch = jest.fn();
				const getState = () => ( {
					userSettings: {
						settings: { foo: 'bar' },
						unsavedSettings: { foo: 'baz' },
					},
				} );
				const action = { type: 'DUMMY' };

				saveUserSettings( action, null )( dispatch, getState );

				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith(
					http(
						{
							apiVersion: '1.1',
							method: 'POST',
							path: '/me/settings',
							body: { foo: 'baz' },
						},
						action
					)
				);
			} );

			test( 'should dispatch POST request to me/settings using explicit settingsOverride', () => {
				const dispatch = jest.fn();
				const getState = () => ( {} );
				const action = {
					type: 'DUMMY',
					settingsOverride: { foo: 'baz' },
				};

				saveUserSettings( action, null )( dispatch, getState );

				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith(
					http(
						{
							apiVersion: '1.1',
							method: 'POST',
							path: '/me/settings',
							body: { foo: 'baz' },
						},
						action
					)
				);
			} );

			test( 'should not dispatch any HTTP request when there are no unsaved settings', () => {
				const dispatch = jest.fn();
				const getState = () => ( {
					userSettings: {
						settings: {},
						unsavedSettings: {},
					},
				} );
				const action = { type: 'DUMMY' };

				saveUserSettings( action, null )( dispatch, getState );

				expect( dispatch ).not.toHaveBeenCalled();
			} );
		} );

		describe( '#finishUserSettingsSave', () => {
			test( 'should dispatch user settings update and clear all unsaved settings on full save', () => {
				const dispatch = jest.fn();
				const action = { type: 'DUMMY' };

				finishUserSettingsSave( action, {
					language: 'qix',
				} )( dispatch );

				expect( dispatch ).toHaveBeenCalledTimes( 2 );
				expect( dispatch ).toHaveBeenCalledWith(
					updateUserSettings( {
						language: 'qix',
					} )
				);
				expect( dispatch ).toHaveBeenCalledWith( clearUnsavedUserSettings() );
			} );

			test( 'should dispatch user settings update and clear only one unsaved setting on partial save', () => {
				const dispatch = jest.fn();
				const data = {
					language: 'qix',
				};
				const action = { type: 'DUMMY', settingsOverride: data };

				finishUserSettingsSave( action, data )( dispatch );

				expect( dispatch ).toHaveBeenCalledTimes( 2 );
				expect( dispatch ).toHaveBeenCalledWith(
					updateUserSettings( {
						language: 'qix',
					} )
				);
				expect( dispatch ).toHaveBeenCalledWith( clearUnsavedUserSettings( [ 'language' ] ) );
			} );

			test( 'should decode HTML entities returned in some fields of HTTP response', () => {
				const dispatch = jest.fn();
				const action = { type: 'DUMMY' };

				finishUserSettingsSave( action, {
					display_name: 'baz &amp; qix',
					description: 'foo &amp; bar',
					user_URL: 'http://example.com?a=b&amp;c=d',
				} )( dispatch );

				expect( dispatch ).toHaveBeenCalledWith(
					updateUserSettings( {
						display_name: 'baz & qix',
						description: 'foo & bar',
						user_URL: 'http://example.com?a=b&c=d',
					} )
				);
			} );
		} );
	} );
} );
