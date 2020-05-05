/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	WP_SUPER_CACHE_RECEIVE_SETTINGS,
	WP_SUPER_CACHE_REQUEST_SETTINGS,
	WP_SUPER_CACHE_REQUEST_SETTINGS_FAILURE,
	WP_SUPER_CACHE_REQUEST_SETTINGS_SUCCESS,
	WP_SUPER_CACHE_RESTORE_SETTINGS,
	WP_SUPER_CACHE_RESTORE_SETTINGS_FAILURE,
	WP_SUPER_CACHE_RESTORE_SETTINGS_SUCCESS,
	WP_SUPER_CACHE_SAVE_SETTINGS,
	WP_SUPER_CACHE_SAVE_SETTINGS_FAILURE,
	WP_SUPER_CACHE_SAVE_SETTINGS_SUCCESS,
} from '../../action-types';
import { receiveSettings, requestSettings, restoreSettings, saveSettings } from '../actions';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;

	useSandbox( ( sandbox ) => ( spy = sandbox.spy() ) );

	const siteId = 123456;
	const failedSiteId = 456789;
	const settings = {
		data: {
			is_cache_enabled: true,
			is_super_cache_enabled: true,
		},
	};

	describe( '#receiveSettings()', () => {
		test( 'should return an action object', () => {
			const action = receiveSettings( siteId, settings.data );

			expect( action ).to.eql( {
				type: WP_SUPER_CACHE_RECEIVE_SETTINGS,
				settings: settings.data,
				siteId,
			} );
		} );
	} );

	describe( '#requestSettings()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.get( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/settings' } )
				.reply( 200, settings )
				.get( `/rest/v1.1/jetpack-blogs/${ failedSiteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/settings' } )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.',
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			requestSettings( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: WP_SUPER_CACHE_REQUEST_SETTINGS,
				siteId,
			} );
		} );

		test( 'should dispatch receive action when request completes', () => {
			return requestSettings( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( receiveSettings( siteId, settings.data ) );
			} );
		} );

		test( 'should dispatch request success action when request completes', () => {
			return requestSettings( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_REQUEST_SETTINGS_SUCCESS,
					siteId,
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return requestSettings( failedSiteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_REQUEST_SETTINGS_FAILURE,
					siteId: failedSiteId,
					error: sinon.match( { message: 'User cannot access this private blog.' } ),
				} );
			} );
		} );
	} );

	describe( 'saveSettings()', () => {
		const updatedSettings = {
			is_cache_enabled: false,
			is_super_cache_enabled: false,
		};
		const apiResponse = {
			data: {
				updated: true,
			},
		};

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.post( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/`, {
					path: '/wp-super-cache/v1/settings',
					body: JSON.stringify( {
						is_cache_enabled: false,
						is_super_cache_enabled: false,
					} ),
					json: true,
				} )
				.reply( 200, apiResponse )
				.post( `/rest/v1.1/jetpack-blogs/${ failedSiteId }/rest-api/`, {
					path: '/wp-super-cache/v1/settings',
					body: JSON.stringify( {
						is_cache_enabled: false,
						is_super_cache_enabled: false,
					} ),
					json: true,
				} )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.',
				} );
		} );

		test( 'should dispatch save action when thunk triggered', () => {
			saveSettings( siteId, updatedSettings )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: WP_SUPER_CACHE_SAVE_SETTINGS,
				siteId,
			} );
		} );

		test( 'should dispatch receive action when request completes', () => {
			return saveSettings(
				siteId,
				updatedSettings
			)( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( receiveSettings( siteId, apiResponse.data ) );
			} );
		} );

		test( 'should dispatch save success action when request completes', () => {
			return saveSettings(
				siteId,
				updatedSettings
			)( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_SAVE_SETTINGS_SUCCESS,
					siteId,
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return saveSettings(
				failedSiteId,
				updatedSettings
			)( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_SAVE_SETTINGS_FAILURE,
					siteId: failedSiteId,
					error: sinon.match( { message: 'User cannot access this private blog.' } ),
				} );
			} );
		} );
	} );

	describe( '#restoreSettings()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.post( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/`, {
					path: '/wp-super-cache/v1/settings',
					body: JSON.stringify( {
						reset: true,
					} ),
					json: true,
				} )
				.reply( 200, settings )
				.post( `/rest/v1.1/jetpack-blogs/${ failedSiteId }/rest-api/`, {
					path: '/wp-super-cache/v1/settings',
					body: JSON.stringify( {
						reset: true,
					} ),
					json: true,
				} )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.',
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			restoreSettings( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: WP_SUPER_CACHE_RESTORE_SETTINGS,
				siteId,
			} );
		} );

		test( 'should dispatch receive action when request completes', () => {
			return restoreSettings( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( receiveSettings( siteId, settings.data ) );
			} );
		} );

		test( 'should dispatch request success action when request completes', () => {
			return restoreSettings( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_RESTORE_SETTINGS_SUCCESS,
					siteId,
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return restoreSettings( failedSiteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_RESTORE_SETTINGS_FAILURE,
					siteId: failedSiteId,
				} );
			} );
		} );
	} );
} );
