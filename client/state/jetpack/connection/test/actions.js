/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	JETPACK_CONNECTION_STATUS_RECEIVE,
	JETPACK_CONNECTION_STATUS_REQUEST,
	JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS,
	JETPACK_CONNECTION_STATUS_REQUEST_FAILURE
} from 'state/action-types';
import { requestJetpackConnectionStatus } from '../actions';
import { useSandbox } from 'test/helpers/use-sinon';
import useNock from 'test/helpers/use-nock';
import { items as ITEMS_FIXTURE } from './fixture';

describe( 'actions', () => {
	const siteId = 12345678;
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	describe( '#requestJetpackConnectionStatus()', () => {
		const status = ITEMS_FIXTURE[ siteId ];

		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/' )
					.query( {
						path: '/jetpack/v4/connection/'
					} )
					.reply( 200, { data: status }, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should dispatch a request connection status action when thunk triggered', () => {
				requestJetpackConnectionStatus( siteId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_CONNECTION_STATUS_REQUEST,
					siteId
				} );
			} );

			it( 'should dispatch success and receive actions when request successfully completes', () => {
				return requestJetpackConnectionStatus( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_CONNECTION_STATUS_RECEIVE,
						siteId,
						status,
					} );

					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS,
						siteId
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/' )
					.query( {
						path: '/jetpack/v4/connection/'
					} )
					.reply( 400, {
						message: 'Invalid request.'
					}, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should dispatch a failure action when request completes unsuccessfully', () => {
				return requestJetpackConnectionStatus( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_CONNECTION_STATUS_REQUEST_FAILURE,
						siteId,
						error: 'Invalid request.'
					} );
				} );
			} );
		} );
	} );
} );
