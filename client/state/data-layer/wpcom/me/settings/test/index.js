/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import * as settingsModule from '../';
import { http } from 'client/state/data-layer/wpcom-http/actions';
import { updateUserSettings, clearUnsavedUserSettings } from 'client/state/user-settings/actions';
import { useSandbox } from 'test/helpers/use-sinon';
jest.mock( 'lib/user', () => () => ( {
	fetch() {},
} ) );

describe( 'wpcom-api', () => {
	let dispatch;
	useSandbox( sandbox => {
		dispatch = sandbox.spy();
	} );

	describe( 'user settings request', () => {
		describe( '#requestUserSettings', () => {
			test( 'should dispatch HTTP GET request to me/settings endpoint', () => {
				const action = { type: 'DUMMY' };

				settingsModule.requestUserSettings( { dispatch }, action );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
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

				settingsModule.storeFetchedUserSettings( { dispatch }, action, {
					language: 'qix',
				} );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					updateUserSettings( {
						language: 'qix',
					} )
				);
			} );

			test( 'should decode HTML entities returned in some fields of HTTP response', () => {
				const action = { type: 'DUMMY' };

				settingsModule.storeFetchedUserSettings( { dispatch }, action, {
					display_name: 'baz &amp; qix',
					description: 'foo &amp; bar',
					user_URL: 'http://example.com?a=b&amp;c=d',
				} );

				expect( dispatch ).to.have.been.calledWith(
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
				const getState = () => ( {
					userSettings: {
						settings: { foo: 'bar' },
						unsavedSettings: { foo: 'baz' },
					},
				} );
				const action = { type: 'DUMMY' };

				settingsModule.saveUserSettings( { dispatch, getState }, action, null );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
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
				const getState = () => ( {} );
				const action = {
					type: 'DUMMY',
					settingsOverride: { foo: 'baz' },
				};

				settingsModule.saveUserSettings( { dispatch, getState }, action, null );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
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
				const getState = () => ( {
					userSettings: {
						settings: {},
						unsavedSettings: {},
					},
				} );
				const action = { type: 'DUMMY' };

				settingsModule.saveUserSettings( { dispatch, getState }, action, null );

				expect( dispatch ).to.not.have.been.called;
			} );
		} );

		describe( '#finishUserSettingsSave', () => {
			test( 'should dispatch user settings update and clear all unsaved settings on full save', () => {
				const action = { type: 'DUMMY' };

				settingsModule.finishUserSettingsSave( { dispatch }, action, {
					language: 'qix',
				} );

				expect( dispatch ).to.have.been.calledTwice;
				expect( dispatch ).to.have.been.calledWith(
					updateUserSettings( {
						language: 'qix',
					} )
				);
				expect( dispatch ).to.have.been.calledWith( clearUnsavedUserSettings() );
			} );

			test( 'should dispatch user settings update and clear only one unsaved setting on partial save', () => {
				const data = {
					language: 'qix',
				};
				const action = { type: 'DUMMY', settingsOverride: data };

				settingsModule.finishUserSettingsSave( { dispatch }, action, data );

				expect( dispatch ).to.have.been.calledTwice;
				expect( dispatch ).to.have.been.calledWith(
					updateUserSettings( {
						language: 'qix',
					} )
				);
				expect( dispatch ).to.have.been.calledWith( clearUnsavedUserSettings( [ 'language' ] ) );
			} );

			test( 'should decode HTML entities returned in some fields of HTTP response', () => {
				const action = { type: 'DUMMY' };

				settingsModule.finishUserSettingsSave( { dispatch }, action, {
					display_name: 'baz &amp; qix',
					description: 'foo &amp; bar',
					user_URL: 'http://example.com?a=b&amp;c=d',
				} );

				expect( dispatch ).to.have.been.calledWith(
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
