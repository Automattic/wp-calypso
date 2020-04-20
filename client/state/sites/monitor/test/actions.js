/**
 * External dependencies
 */
import { expect } from 'chai';
import { match } from 'sinon';

/**
 * Internal dependencies
 */
import { requestSiteMonitorSettings, updateSiteMonitorSettings } from '../actions';
import {
	SITE_MONITOR_SETTINGS_RECEIVE,
	SITE_MONITOR_SETTINGS_REQUEST,
	SITE_MONITOR_SETTINGS_REQUEST_FAILURE,
	SITE_MONITOR_SETTINGS_REQUEST_SUCCESS,
	SITE_MONITOR_SETTINGS_UPDATE,
	SITE_MONITOR_SETTINGS_UPDATE_FAILURE,
	SITE_MONITOR_SETTINGS_UPDATE_SUCCESS,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => ( spy = sandbox.spy() ) );

	const siteId = 12345678;

	describe( '#requestSiteMonitorSettings()', () => {
		const successResponse = {
			success: true,
			settings: {
				email_notifications: true,
				monitor_active: true,
				wp_note_notifications: true,
			},
		};

		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/jetpack-blogs/' + siteId )
					.reply( 200, successResponse );
			} );

			test( 'should dispatch a monitor settings request action when thunk triggered', () => {
				requestSiteMonitorSettings( siteId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: SITE_MONITOR_SETTINGS_REQUEST,
					siteId,
				} );
			} );

			test( 'should dispatch monitor settings request success and receive actions upon success', () => {
				return requestSiteMonitorSettings( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: SITE_MONITOR_SETTINGS_RECEIVE,
						siteId,
						settings: successResponse.settings,
					} );

					expect( spy ).to.have.been.calledWith( {
						type: SITE_MONITOR_SETTINGS_REQUEST_SUCCESS,
						siteId,
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			const errorMessage = 'This user is not authorized to request monitor settings for this blog.';
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/jetpack-blogs/' + siteId )
					.reply( 403, {
						error: 'unauthorized',
						message: errorMessage,
					} );
			} );

			test( 'should dispatch monitor settings request failure action upon error', () => {
				return requestSiteMonitorSettings( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: SITE_MONITOR_SETTINGS_REQUEST_FAILURE,
						siteId,
						error: match( { message: errorMessage } ),
					} );
				} );
			} );
		} );
	} );

	describe( '#updateSiteMonitorSettings()', () => {
		const requestSettings = {
			email_notifications: true,
			wp_note_notifications: true,
		};
		const settings = {
			...requestSettings,
			monitor_active: true,
		};

		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId, requestSettings )
					.reply( 200, {
						success: true,
					} );
			} );

			test( 'should dispatch a monitor settings request action when thunk triggered', () => {
				updateSiteMonitorSettings( siteId, settings )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: SITE_MONITOR_SETTINGS_UPDATE,
					siteId,
					settings,
				} );
			} );

			test( 'should dispatch monitor settings request success action upon success', () => {
				return updateSiteMonitorSettings(
					siteId,
					settings
				)( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: SITE_MONITOR_SETTINGS_UPDATE_SUCCESS,
						siteId,
						settings,
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			const errorMessage = 'This user is not authorized to update monitor settings for this blog.';
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId, requestSettings )
					.reply( 403, {
						error: 'unauthorized',
						message: errorMessage,
					} );
			} );

			test( 'should dispatch monitor settings request failure action upon error', () => {
				return updateSiteMonitorSettings(
					siteId,
					settings
				)( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: SITE_MONITOR_SETTINGS_UPDATE_FAILURE,
						siteId,
						settings,
						error: match( { message: errorMessage } ),
					} );
				} );
			} );
		} );
	} );
} );
