/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	requestJetpackConnectionStatus,
	requestJetpackUserConnectionData,
	disconnect,
} from '../actions';
import { items as ITEMS_FIXTURE, dataItems as DATA_ITEMS_FIXTURE } from './fixture';
import {
	JETPACK_CONNECTION_STATUS_RECEIVE,
	JETPACK_CONNECTION_STATUS_REQUEST,
	JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS,
	JETPACK_CONNECTION_STATUS_REQUEST_FAILURE,
	JETPACK_DISCONNECT_REQUEST,
	JETPACK_DISCONNECT_REQUEST_SUCCESS,
	JETPACK_DISCONNECT_REQUEST_FAILURE,
	JETPACK_DISCONNECT_RECEIVE,
	JETPACK_USER_CONNECTION_DATA_RECEIVE,
	JETPACK_USER_CONNECTION_DATA_REQUEST,
	JETPACK_USER_CONNECTION_DATA_REQUEST_SUCCESS,
	JETPACK_USER_CONNECTION_DATA_REQUEST_FAILURE,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	const siteId = 12345678;
	let spy;
	useSandbox( ( sandbox ) => ( spy = sandbox.spy() ) );

	describe( '#requestJetpackConnectionStatus()', () => {
		const status = ITEMS_FIXTURE[ siteId ];

		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/' )
					.query( {
						path: '/jetpack/v4/connection/',
					} )
					.reply(
						200,
						{ data: status },
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should dispatch a request connection status action when thunk triggered', () => {
				requestJetpackConnectionStatus( siteId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_CONNECTION_STATUS_REQUEST,
					siteId,
				} );
			} );

			test( 'should dispatch success and receive actions when request successfully completes', () => {
				return requestJetpackConnectionStatus( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_CONNECTION_STATUS_RECEIVE,
						siteId,
						status,
					} );

					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS,
						siteId,
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
						path: '/jetpack/v4/connection/',
					} )
					.reply(
						400,
						{
							message: 'Invalid request.',
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should dispatch a failure action when request completes unsuccessfully', () => {
				return requestJetpackConnectionStatus( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_CONNECTION_STATUS_REQUEST_FAILURE,
						siteId,
						error: 'Invalid request.',
					} );
				} );
			} );
		} );
	} );

	describe( '#requestJetpackUserConnectionData()', () => {
		const data = DATA_ITEMS_FIXTURE[ siteId ];

		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/' )
					.query( {
						path: '/jetpack/v4/connection/data/',
					} )
					.reply(
						200,
						{
							data: {
								currentUser: data,
							},
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should dispatch a request user connection data action when thunk triggered', () => {
				requestJetpackUserConnectionData( siteId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_USER_CONNECTION_DATA_REQUEST,
					siteId,
				} );
			} );

			test( 'should dispatch success and receive actions when request successfully completes', () => {
				return requestJetpackUserConnectionData( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_USER_CONNECTION_DATA_RECEIVE,
						siteId,
						data,
					} );

					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_USER_CONNECTION_DATA_REQUEST_SUCCESS,
						siteId,
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
						path: '/jetpack/v4/connection/data/',
					} )
					.reply(
						400,
						{
							message: 'Invalid request.',
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should dispatch a failure action when request completes unsuccessfully', () => {
				return requestJetpackUserConnectionData( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_USER_CONNECTION_DATA_REQUEST_FAILURE,
						siteId,
						error: 'Invalid request.',
					} );
				} );
			} );
		} );
	} );

	describe( '#disconnect()', () => {
		const status = {
			success: true,
			message: 'Site Name has been disconnected.',
		};

		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/mine/delete' )
					.reply( 200, status, {
						'Content-Type': 'application/json',
					} );
			} );

			test( 'should dispatch a request disconnect request action when thunk triggered', () => {
				disconnect( siteId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_DISCONNECT_REQUEST,
					siteId,
				} );
			} );

			test( 'should dispatch success and receive actions when disconnect request successfully completes', () => {
				return disconnect( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_DISCONNECT_RECEIVE,
						siteId,
						status,
					} );

					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_DISCONNECT_REQUEST_SUCCESS,
						siteId,
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			const error = {
				code: 'unauthorized',
				message: 'Invalid request.',
			};

			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/mine/delete' )
					.reply( 400, error, {
						'Content-Type': 'application/json',
					} );
			} );

			test( 'should dispatch a failure action when disconnect request completes unsuccessfully', () => {
				return disconnect( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_DISCONNECT_REQUEST_FAILURE,
						siteId,
						error: 'Invalid request.',
					} );
				} );
			} );
		} );
	} );
} );
