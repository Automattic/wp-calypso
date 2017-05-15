/**
 * External dependencies
 */
import { expect } from 'chai';
import mockery from 'mockery';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import { useSandbox } from 'test/helpers/use-sinon';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	updateUserSettings,
	clearUnsavedUserSettings,
} from 'state/user-settings/actions';

describe( 'wpcom-api', () => {
	let dispatch, next, settingsModule;

	useSandbox( sandbox => {
		dispatch = sandbox.spy();
		next = sandbox.spy();
	} );

	useMockery( () => {
		mockery.registerMock( 'lib/user', () => ( {
			fetch() {}
		} ) );
		settingsModule = require( '../' );
	} );

	describe( 'user settings request', () => {
		describe( '#requestUserSettings', () => {
			it( 'should dispatch HTTP GET request to me/settings endpoint', () => {
				const action = { type: 'DUMMY' };

				settingsModule.requestUserSettings( { dispatch }, action, next );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.1',
					method: 'GET',
					path: '/me/settings',
				}, action ) );
			} );

			it( 'should pass the original action along the middleware chain', () => {
				const action = { type: 'DUMMY' };

				settingsModule.requestUserSettings( { dispatch }, action, next );

				expect( next ).to.have.been.calledWith( action );
			} );
		} );

		describe( '#storeFetchedUserSettings', () => {
			it( 'should dispatch user settings update', () => {
				const action = { type: 'DUMMY' };

				settingsModule.storeFetchedUserSettings( { dispatch }, action, next, {
					language: 'qix',
				} );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( updateUserSettings( {
					language: 'qix',
				} ) );
			} );

			it( 'should decode HTML entities returned in some fields of HTTP response', () => {
				const action = { type: 'DUMMY' };

				settingsModule.storeFetchedUserSettings( { dispatch }, action, next, {
					display_name: 'baz &amp; qix',
					description: 'foo &amp; bar',
					user_URL: 'http://example.com?a=b&amp;c=d',
				} );

				expect( dispatch ).to.have.been.calledWith( updateUserSettings( {
					display_name: 'baz & qix',
					description: 'foo & bar',
					user_URL: 'http://example.com?a=b&c=d',
				} ) );
			} );
		} );
	} );

	describe( 'user settings save', () => {
		describe( '#saveUserSettings', () => {
			it( 'should dispatch POST request to me/settings using unsavedSettings from state', () => {
				const getState = () => ( {
					userSettings: {
						settings: { foo: 'bar' },
						unsavedSettings: { foo: 'baz' }
					}
				} );
				const action = { type: 'DUMMY' };

				settingsModule.saveUserSettings( { dispatch, getState }, action, next );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.1',
					method: 'POST',
					path: '/me/settings',
					body: { foo: 'baz' }
				}, action ) );
				expect( next ).to.have.been.calledWith( action );
			} );

			it( 'should dispatch POST request to me/settings using explicit settingsOverride', () => {
				const getState = () => ( {} );
				const action = {
					type: 'DUMMY',
					settingsOverride: { foo: 'baz' }
				};

				settingsModule.saveUserSettings( { dispatch, getState }, action, next );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.1',
					method: 'POST',
					path: '/me/settings',
					body: { foo: 'baz' }
				}, action ) );
				expect( next ).to.have.been.calledWith( action );
			} );

			it( 'should not dispatch any HTTP request when there are no unsaved settings', () => {
				const getState = () => ( {
					userSettings: {
						settings: {},
						unsavedSettings: {}
					}
				} );
				const action = { type: 'DUMMY' };

				settingsModule.saveUserSettings( { dispatch, getState }, action, next );

				expect( dispatch ).to.not.have.been.called;
				expect( next ).to.have.been.calledWith( action );
			} );
		} );

		describe( '#finishUserSettingsSave', () => {
			it( 'should dispatch user settings update and clear all unsaved settings on full save', () => {
				const action = { type: 'DUMMY' };

				settingsModule.finishUserSettingsSave( { dispatch }, action, next, {
					language: 'qix',
				} );

				expect( dispatch ).to.have.been.calledTwice;
				expect( dispatch ).to.have.been.calledWith( updateUserSettings( {
					language: 'qix',
				} ) );
				expect( dispatch ).to.have.been.calledWith( clearUnsavedUserSettings() );
			} );

			it( 'should dispatch user settings update and clear only one unsaved setting on partial save', () => {
				const data = {
					language: 'qix',
				};
				const action = { type: 'DUMMY', settingsOverride: data };

				settingsModule.finishUserSettingsSave( { dispatch }, action, next, data );

				expect( dispatch ).to.have.been.calledTwice;
				expect( dispatch ).to.have.been.calledWith( updateUserSettings( {
					language: 'qix'
				} ) );
				expect( dispatch ).to.have.been.calledWith( clearUnsavedUserSettings( [
					'language'
				] ) );
			} );

			it( 'should decode HTML entities returned in some fields of HTTP response', () => {
				const action = { type: 'DUMMY' };

				settingsModule.finishUserSettingsSave( { dispatch }, action, next, {
					display_name: 'baz &amp; qix',
					description: 'foo &amp; bar',
					user_URL: 'http://example.com?a=b&amp;c=d',
				} );

				expect( dispatch ).to.have.been.calledWith( updateUserSettings( {
					display_name: 'baz & qix',
					description: 'foo & bar',
					user_URL: 'http://example.com?a=b&c=d',
				} ) );
			} );
		} );
	} );
} );
