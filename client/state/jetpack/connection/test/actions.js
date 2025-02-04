import {
	JETPACK_CONNECTION_STATUS_RECEIVE,
	JETPACK_CONNECTION_STATUS_REQUEST,
	JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS,
	JETPACK_CONNECTION_STATUS_REQUEST_FAILURE,
	JETPACK_DISCONNECT_RECEIVE,
	JETPACK_USER_CONNECTION_DATA_RECEIVE,
	JETPACK_USER_CONNECTION_DATA_REQUEST,
	JETPACK_USER_CONNECTION_DATA_REQUEST_SUCCESS,
	JETPACK_USER_CONNECTION_DATA_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import useNock from 'calypso/test-helpers/use-nock';
import {
	requestJetpackConnectionStatus,
	requestJetpackUserConnectionData,
	disconnect,
} from '../actions';
import { items as ITEMS_FIXTURE, dataItems as DATA_ITEMS_FIXTURE } from './fixture';

describe( 'actions', () => {
	const siteId = 12345678;
	let spy;

	beforeEach( () => {
		spy = jest.fn();
	} );

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

				expect( spy ).toHaveBeenCalledWith( {
					type: JETPACK_CONNECTION_STATUS_REQUEST,
					siteId,
				} );
			} );

			test( 'should dispatch success and receive actions when request successfully completes', () => {
				return requestJetpackConnectionStatus( siteId )( spy ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						type: JETPACK_CONNECTION_STATUS_RECEIVE,
						siteId,
						status,
					} );

					expect( spy ).toHaveBeenCalledWith( {
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
					expect( spy ).toHaveBeenCalledWith( {
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

				expect( spy ).toHaveBeenCalledWith( {
					type: JETPACK_USER_CONNECTION_DATA_REQUEST,
					siteId,
				} );
			} );

			test( 'should dispatch success and receive actions when request successfully completes', async () => {
				await requestJetpackUserConnectionData( siteId )( spy );

				expect( spy ).toHaveBeenCalledWith( {
					type: JETPACK_USER_CONNECTION_DATA_RECEIVE,
					siteId,
					data: {
						currentUser: data,
					},
				} );

				expect( spy ).toHaveBeenCalledWith( {
					type: JETPACK_USER_CONNECTION_DATA_REQUEST_SUCCESS,
					siteId,
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
					expect( spy ).toHaveBeenCalledWith( {
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

			test( 'should dispatch a receive action when disconnect request successfully completes', () => {
				return disconnect( siteId )( spy ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						type: JETPACK_DISCONNECT_RECEIVE,
						siteId,
						status,
					} );
				} );
			} );
		} );
	} );
} );
