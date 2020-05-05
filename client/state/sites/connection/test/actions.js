/**
 * External dependencies
 */
import { expect } from 'chai';
import { match } from 'sinon';

/**
 * Internal dependencies
 */
import { requestConnectionStatus } from '../actions';
import {
	SITE_CONNECTION_STATUS_RECEIVE,
	SITE_CONNECTION_STATUS_REQUEST,
	SITE_CONNECTION_STATUS_REQUEST_FAILURE,
	SITE_CONNECTION_STATUS_REQUEST_SUCCESS,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => ( spy = sandbox.spy() ) );

	const siteId = 12345678;

	describe( '#requestConnectionStatus()', () => {
		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/jetpack-blogs/' + siteId + '/test-connection' )
					.reply( 200, {
						connected: true,
						message: 'User is connected.',
					} );
			} );

			test( 'should dispatch a connection status request action when thunk triggered', () => {
				requestConnectionStatus( siteId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: SITE_CONNECTION_STATUS_REQUEST,
					siteId,
				} );
			} );

			test( 'should dispatch connection status request success and receive actions upon success', () => {
				return requestConnectionStatus( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: SITE_CONNECTION_STATUS_RECEIVE,
						siteId,
						status: true,
					} );

					expect( spy ).to.have.been.calledWith( {
						type: SITE_CONNECTION_STATUS_REQUEST_SUCCESS,
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
					.get( '/rest/v1.1/jetpack-blogs/' + siteId + '/test-connection' )
					.reply( 403, {
						error: 'unauthorized',
						message: errorMessage,
					} );
			} );

			test( 'should dispatch connection status request failure action upon error', () => {
				return requestConnectionStatus( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: SITE_CONNECTION_STATUS_REQUEST_FAILURE,
						siteId,
						error: match( { message: errorMessage } ),
					} );
				} );
			} );
		} );
	} );
} );
