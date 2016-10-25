/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	PUBLICIZE_CONNECTION_CREATE,
	PUBLICIZE_CONNECTION_CREATE_FAILURE,
	PUBLICIZE_CONNECTION_DELETE,
	PUBLICIZE_CONNECTION_DELETE_FAILURE,
	PUBLICIZE_CONNECTION_UPDATE,
	PUBLICIZE_CONNECTION_UPDATE_FAILURE,
	PUBLICIZE_CONNECTIONS_REQUEST,
	PUBLICIZE_CONNECTIONS_RECEIVE,
	PUBLICIZE_CONNECTIONS_REQUEST_FAILURE
} from 'state/action-types';
import {
	fetchConnections,
	createSiteConnection,
	updateSiteConnection,
	deleteSiteConnection,
	deleteConnection,
	receiveConnections,
	failConnectionsRequest
} from '../actions';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	describe( '#fetchConnections()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/publicize-connections' )
				.reply( 200, {
					connections: [
						{ ID: 2, site_ID: 2916284 }
					]
				} )
				.get( '/rest/v1.1/sites/77203074/publicize-connections' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'An active access token must be used to access publicize connections.'
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			fetchConnections( 2916284 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: PUBLICIZE_CONNECTIONS_REQUEST,
				siteId: 2916284
			} );
		} );

		it( 'should dispatch receive action when request completes', ( done ) => {
			fetchConnections( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledTwice;

				const action = spy.getCall( 1 ).args[ 0 ];
				expect( action.type ).to.equal( PUBLICIZE_CONNECTIONS_RECEIVE );
				expect( action.siteId ).to.equal( 2916284 );
				expect( action.data.connections ).to.eql( [ { ID: 2, site_ID: 2916284 } ] );

				done();
			} ).catch( done );
		} );

		it( 'should dispatch fail action when request fails', ( done ) => {
			fetchConnections( 77203074 )( spy ).then( () => {
				expect( spy ).to.have.been.calledTwice;

				const action = spy.getCall( 1 ).args[ 0 ];
				expect( action.type ).to.equal( PUBLICIZE_CONNECTIONS_REQUEST_FAILURE );
				expect( action.siteId ).to.equal( 77203074 );
				expect( action.error.message ).to.equal( 'An active access token must be used to access publicize connections.' );

				done();
			} ).catch( done );
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
					message: 'An active access token must be used to access publicize connections.'
				} );
		} );

		it( 'should dispatch create action when request completes', () => {
			createSiteConnection( 2916284, 2, 1 )( spy ).then( () => {
				const action = spy.getCall( 0 ).args[ 0 ];

				expect( action.type ).to.equal( PUBLICIZE_CONNECTION_CREATE );
				expect( action.connection ).to.eql( { ID: 2, site_ID: 2916284 } );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			createSiteConnection( 77203074, 2, 1 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PUBLICIZE_CONNECTION_CREATE_FAILURE,
					error: sinon.match( { message: 'An active access token must be used to access publicize connections.' } )
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
					message: 'An active access token must be used to access publicize connections.'
				} );
		} );

		it( 'should dispatch update action when request completes', () => {
			updateSiteConnection( 2916284, 2, attributes )( spy ).then( () => {
				const action = spy.getCall( 0 ).args[ 0 ];

				expect( action.type ).to.equal( PUBLICIZE_CONNECTION_UPDATE );
				expect( action.connection ).to.eql( { ID: 2, site_ID: 2916284 } );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			updateSiteConnection( 77203074, 2, attributes )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PUBLICIZE_CONNECTION_UPDATE_FAILURE,
					error: sinon.match( { message: 'An active access token must be used to access publicize connections.' } )
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
					message: 'An active access token must be used to access publicize connections.'
				} );
		} );

		it( 'should dispatch delete action when request completes', () => {
			deleteSiteConnection( { ID: 2, site_ID: 2916284 } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PUBLICIZE_CONNECTION_DELETE,
					connection: {
						ID: 2,
						site_ID: 2916284,
					},
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			deleteSiteConnection( { ID: 2, site_ID: 77203074 } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PUBLICIZE_CONNECTION_DELETE_FAILURE,
					error: sinon.match( { message: 'An active access token must be used to access publicize connections.' } )
				} );
			} );
		} );
	} );

	describe( 'deleteConnections()', () => {
		it( 'should return an action object', () => {
			const action = deleteConnection( { ID: 2, site_ID: 2916284 } );

			expect( action ).to.eql( {
				type: PUBLICIZE_CONNECTION_DELETE,
				connection: {
					ID: 2,
					site_ID: 2916284,
				},
			} );
		} );
	} );

	describe( '#receiveConnections()', () => {
		it( 'should return an action object', () => {
			const data = { connections: [ { ID: 2, site_ID: 2916284 } ] };
			const action = receiveConnections( 2916284, data );

			expect( action ).to.eql( {
				type: PUBLICIZE_CONNECTIONS_RECEIVE,
				siteId: 2916284,
				data
			} );
		} );
	} );

	describe( '#failConnectionsRequest()', () => {
		it( 'should return an action object', () => {
			const error = new Error();
			const action = failConnectionsRequest( 2916284, error );

			expect( action ).to.eql( {
				type: PUBLICIZE_CONNECTIONS_REQUEST_FAILURE,
				siteId: 2916284,
				error
			} );
		} );
	} );
} );
