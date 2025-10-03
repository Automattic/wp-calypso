import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { successNotice } from 'calypso/state/notices/actions';
import {
	saveUserSettingsSuccess,
	clearUnsavedUserSettings,
} from 'calypso/state/user-settings/actions';
import {
	requestUserSettings,
	storeFetchedUserSettings,
	fromApi,
	userSettingsSave,
	userSettingsSaveSuccess,
} from '../';

jest.mock( 'calypso/state/current-user/actions', () => ( {
	fetchCurrentUser: jest.fn(),
} ) );

jest.mock( '@wordpress/url', () => ( {
	getQueryArg: jest.fn().mockReturnValue( null ),
} ) );

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
					saveUserSettingsSuccess( {
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
					saveUserSettingsSuccess( {
						display_name: 'baz & qix',
						description: 'foo & bar',
						user_URL: 'http://example.com?a=b&c=d',
					} )
				);
			} );
		} );
	} );

	describe( 'user settings save', () => {
		describe( '#userSettingsSave', () => {
			test( 'should dispatch POST request to me/settings using unsavedSettings from state', () => {
				const dispatch = jest.fn();
				const getState = () => ( {
					userSettings: {
						settings: { foo: 'bar' },
						unsavedSettings: { foo: 'baz' },
					},
				} );
				const action = { type: 'DUMMY' };

				userSettingsSave( action, null )( dispatch, getState );

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

				userSettingsSave( action, null )( dispatch, getState );

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

				userSettingsSave( action, null )( dispatch, getState );

				expect( dispatch ).not.toHaveBeenCalled();
			} );
		} );

		describe( '#userSettingsSaveSuccess', () => {
			const { getQueryArg } = require( '@wordpress/url' );

			beforeEach( () => {
				getQueryArg.mockReset();
				getQueryArg.mockReturnValue( null );
			} );

			test( 'should dispatch user settings update and clear all unsaved settings on full save', async () => {
				const dispatch = jest.fn();
				const action = { type: 'DUMMY' };

				await userSettingsSaveSuccess( action, {
					language: 'qix',
				} )( dispatch );

				expect( dispatch ).toHaveBeenCalledTimes( 4 );
				expect( dispatch ).toHaveBeenCalledWith(
					saveUserSettingsSuccess( {
						language: 'qix',
					} )
				);
				expect( dispatch ).toHaveBeenCalledWith( clearUnsavedUserSettings() );
				expect( dispatch ).toHaveBeenCalledWith(
					successNotice( 'Settings saved successfully!', {
						id: 'save-user-settings',
					} )
				);
			} );

			test( 'should not show success notice when ref=reader-onboarding', async () => {
				const dispatch = jest.fn();
				const action = { type: 'DUMMY' };
				getQueryArg.mockReturnValue( 'reader-onboarding' );

				await userSettingsSaveSuccess( action, {
					language: 'qix',
				} )( dispatch );

				expect( dispatch ).toHaveBeenCalledTimes( 3 );
				expect( dispatch ).toHaveBeenCalledWith(
					saveUserSettingsSuccess( {
						language: 'qix',
					} )
				);
				expect( dispatch ).toHaveBeenCalledWith( clearUnsavedUserSettings() );
				expect( dispatch ).not.toHaveBeenCalledWith(
					successNotice( 'Settings saved successfully!', {
						id: 'save-user-settings',
					} )
				);
			} );

			test( 'should dispatch user settings update and clear only one unsaved setting on partial save', async () => {
				const dispatch = jest.fn();
				const data = {
					language: 'qix',
				};
				const action = { type: 'DUMMY', settingsOverride: data };

				await userSettingsSaveSuccess( action, data )( dispatch );

				expect( dispatch ).toHaveBeenCalledTimes( 4 );
				expect( dispatch ).toHaveBeenCalledWith(
					saveUserSettingsSuccess( {
						language: 'qix',
					} )
				);
				expect( dispatch ).toHaveBeenCalledWith( clearUnsavedUserSettings( [ 'language' ] ) );
				expect( dispatch ).toHaveBeenCalledWith(
					successNotice( 'Settings saved successfully!', {
						id: 'save-user-settings',
					} )
				);
			} );

			test( 'should decode HTML entities returned in some fields of HTTP response', () => {
				const dispatch = jest.fn();
				const action = { type: 'DUMMY' };

				userSettingsSaveSuccess( action, {
					display_name: 'baz &amp; qix',
					description: 'foo &amp; bar',
					user_URL: 'http://example.com?a=b&amp;c=d',
				} )( dispatch );

				expect( dispatch ).toHaveBeenCalledWith(
					saveUserSettingsSuccess( {
						display_name: 'baz & qix',
						description: 'foo & bar',
						user_URL: 'http://example.com?a=b&c=d',
					} )
				);
			} );
		} );
	} );
} );
