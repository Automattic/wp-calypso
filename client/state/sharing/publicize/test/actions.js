import {
	NOTICE_CREATE,
	PUBLICIZE_CONNECTION_CREATE,
	PUBLICIZE_CONNECTION_DELETE,
	PUBLICIZE_CONNECTION_DELETE_FAILURE,
	PUBLICIZE_CONNECTION_RECEIVE,
	PUBLICIZE_CONNECTION_UPDATE,
	PUBLICIZE_CONNECTION_UPDATE_FAILURE,
	PUBLICIZE_CONNECTIONS_REQUEST,
	PUBLICIZE_CONNECTIONS_RECEIVE,
	PUBLICIZE_CONNECTIONS_REQUEST_FAILURE,
	PUBLICIZE_CONNECTIONS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import useNock from 'calypso/test-helpers/use-nock';
import {
	createSiteConnection,
	deleteSiteConnection,
	deleteConnection,
	fetchConnection,
	fetchConnections,
	receiveConnections,
	updateSiteConnection,
} from '../actions';

describe( 'actions', () => {
	let spy;

	beforeEach( () => {
		spy = jest.fn();
	} );

	describe( '#fetchConnections()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/publicize-connections' )
				.reply( 200, {
					connections: [ { ID: 2, site_ID: 2916284 } ],
				} )
				.get( '/rest/v1.1/sites/77203074/publicize-connections' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'An active access token must be used to access publicize connections.',
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			return fetchConnections( 2916284 )( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: PUBLICIZE_CONNECTIONS_REQUEST,
					siteId: 2916284,
				} );
			} );
		} );

		test( 'should dispatch receive action when request completes', () => {
			return fetchConnections( 2916284 )( spy ).then( () => {
				expect( spy ).toHaveBeenCalledTimes( 3 );

				const action1 = spy.mock.calls[ 1 ][ 0 ];
				expect( action1.type ).toEqual( PUBLICIZE_CONNECTIONS_RECEIVE );
				expect( action1.siteId ).toEqual( 2916284 );
				expect( action1.data.connections ).toEqual( [ { ID: 2, site_ID: 2916284 } ] );

				const action2 = spy.mock.calls[ 2 ][ 0 ];
				expect( action2.type ).toEqual( PUBLICIZE_CONNECTIONS_REQUEST_SUCCESS );
				expect( action2.siteId ).toEqual( 2916284 );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return fetchConnections( 77203074 )( spy ).then( () => {
				expect( spy ).toHaveBeenCalledTimes( 2 );

				const action = spy.mock.calls[ 1 ][ 0 ];
				expect( action.type ).toEqual( PUBLICIZE_CONNECTIONS_REQUEST_FAILURE );
				expect( action.siteId ).toEqual( 77203074 );
				expect( action.error.message ).toEqual(
					'An active access token must be used to access publicize connections.'
				);
			} );
		} );
	} );

	describe( 'fetchConnection()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/publicize-connections/2' )
				.reply( 200, { ID: 2, site_ID: 2916284 } );
		} );

		test( 'should dispatch receive action when request completes', () => {
			return fetchConnection(
				2916284,
				2
			)( spy ).then( () => {
				const action1 = spy.mock.calls[ 0 ][ 0 ];
				expect( action1.type ).toEqual( PUBLICIZE_CONNECTION_RECEIVE );
				expect( action1.siteId ).toEqual( 2916284 );
				expect( action1.connection ).toEqual( { ID: 2, site_ID: 2916284 } );
			} );
		} );
	} );

	describe( 'createSiteConnection()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/sites/2916284/publicize-connections/new', {
					external_user_ID: 1,
					keyring_connection_ID: 2,
					shared: false,
				} )
				.reply( 200, {
					ID: 2,
					site_ID: 2916284,
				} )
				.post( '/rest/v1.1/sites/77203074/publicize-connections/new', {
					external_user_ID: 1,
					keyring_connection_ID: 2,
					shared: false,
				} )
				.reply( 403, {
					error: 'authorization_required',
					message: 'An active access token must be used to access publicize connections.',
				} );
		} );

		test( 'should dispatch create action when request completes', () => {
			return createSiteConnection(
				2916284,
				2,
				1
			)( spy ).then( () => {
				const action = spy.mock.calls[ 0 ][ 0 ];

				expect( action.type ).toEqual( PUBLICIZE_CONNECTION_CREATE );
				expect( action.connection ).toEqual( { ID: 2, site_ID: 2916284 } );
			} );
		} );

		test( 'should dispatch notice action when request fails', () => {
			return createSiteConnection(
				77203074,
				2,
				1
			)( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: NOTICE_CREATE,
					notice: {
						text: 'An active access token must be used to access publicize connections.',
						noticeId: 'publicize',
						showDismiss: true,
						status: 'is-error',
					},
				} );
			} );
		} );
	} );

	describe( 'updateSiteConnection()', () => {
		const attributes = { shared: true };

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/sites/2916284/publicize-connections/2', {
					shared: true,
				} )
				.reply( 200, {
					ID: 2,
					site_ID: 2916284,
				} )
				.post( '/rest/v1.1/sites/77203074/publicize-connections/2', {
					shared: true,
				} )
				.reply( 403, {
					error: 'authorization_required',
					message: 'An active access token must be used to access publicize connections.',
				} );
		} );

		test( 'should dispatch update action when request completes', () => {
			return updateSiteConnection(
				{ ID: 2, site_ID: 2916284, label: 'Facebook' },
				attributes
			)( spy ).then( () => {
				const action = spy.mock.calls[ 0 ][ 0 ];

				expect( action.type ).toEqual( PUBLICIZE_CONNECTION_UPDATE );
				expect( action.connection ).toEqual( { ID: 2, site_ID: 2916284 } );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return updateSiteConnection(
				{ ID: 2, site_ID: 77203074, label: 'Facebook' },
				attributes
			)( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: PUBLICIZE_CONNECTION_UPDATE_FAILURE,
					error: expect.objectContaining( {
						message: 'An active access token must be used to access publicize connections.',
					} ),
				} );
			} );
		} );
	} );

	describe( 'deleteSiteConnection()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/sites/2916284/publicize-connections/2/delete' )
				.reply( 200, {
					ID: 2,
					deleted: true,
				} )
				.post( '/rest/v1.1/sites/77203074/publicize-connections/2/delete' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'An active access token must be used to access publicize connections.',
				} );
		} );

		test( 'should dispatch delete action when request completes', () => {
			return deleteSiteConnection( { ID: 2, site_ID: 2916284 } )( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: PUBLICIZE_CONNECTION_DELETE,
					connection: {
						ID: 2,
						site_ID: 2916284,
					},
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return deleteSiteConnection( { ID: 2, site_ID: 77203074 } )( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: PUBLICIZE_CONNECTION_DELETE_FAILURE,
					error: expect.objectContaining( {
						message: 'An active access token must be used to access publicize connections.',
					} ),
				} );
			} );
		} );
	} );

	describe( 'deleteConnections()', () => {
		test( 'should return an action object', () => {
			const action = deleteConnection( { ID: 2, site_ID: 2916284 } );

			expect( action ).toEqual( {
				type: PUBLICIZE_CONNECTION_DELETE,
				connection: {
					ID: 2,
					site_ID: 2916284,
				},
			} );
		} );
	} );

	describe( '#receiveConnections()', () => {
		test( 'should return an action object', () => {
			const data = { connections: [ { ID: 2, site_ID: 2916284 } ] };
			const action = receiveConnections( 2916284, data );

			expect( action ).toEqual( {
				type: PUBLICIZE_CONNECTIONS_RECEIVE,
				siteId: 2916284,
				data,
			} );
		} );
	} );
} );
