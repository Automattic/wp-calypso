/**
 * External dependencies
 */
import { expect } from 'chai';
import { match } from 'sinon';

/**
 * Internal dependencies
 */
import { requestSiteMonitorSettings } from '../actions';
import { useSandbox } from 'test/helpers/use-sinon';
import useNock from 'test/helpers/use-nock';
import {
	SITE_MONITOR_SETTINGS_RECEIVE,
	SITE_MONITOR_SETTINGS_REQUEST,
	SITE_MONITOR_SETTINGS_REQUEST_FAILURE,
	SITE_MONITOR_SETTINGS_REQUEST_SUCCESS,
} from 'state/action-types';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	const siteId = 12345678;

	describe( '#requestSiteMonitorSettings()', () => {
		const successResponse = {
			success: true,
			settings: {
				email_notifications: true,
				monitor_active: true,
				wp_note_notifications: true,
			}
		};

		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/jetpack-blogs/' + siteId )
					.reply( 200, successResponse );
			} );

			it( 'should dispatch a monitor settings request action when thunk triggered', () => {
				requestSiteMonitorSettings( siteId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: SITE_MONITOR_SETTINGS_REQUEST,
					siteId,
				} );
			} );

			it( 'should dispatch monitor settings request success and receive actions upon success', () => {
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
			const errorMessage = 'This user is not authorized to test connection for this blog.';
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/jetpack-blogs/' + siteId )
					.reply( 403, {
						error: 'unauthorized',
						message: errorMessage,
					} );
			} );

			it( 'should dispatch monitor settings request failure action upon error', () => {
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
} );
