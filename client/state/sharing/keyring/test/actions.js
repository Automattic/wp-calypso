/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	requestKeyringConnections,
	deleteKeyringConnection,
	deleteStoredKeyringConnection,
} from '../actions';
import {
	KEYRING_CONNECTION_DELETE,
	KEYRING_CONNECTION_DELETE_FAILURE,
	KEYRING_CONNECTIONS_RECEIVE,
	KEYRING_CONNECTIONS_REQUEST,
	KEYRING_CONNECTIONS_REQUEST_FAILURE,
	KEYRING_CONNECTIONS_REQUEST_SUCCESS,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => ( spy = sandbox.spy() ) );

	describe( 'requestKeyringConnections()', () => {
		describe( 'successful requests', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/me/keyring-connections' )
					.reply( 200, {
						connections: [ { ID: 4306907 }, { ID: 7589550 } ],
					} );
			} );

			test( 'should dispatch fetch action when thunk triggered', () => {
				requestKeyringConnections()( spy );

				expect( spy ).to.have.been.calledWith( {
					type: KEYRING_CONNECTIONS_REQUEST,
				} );
			} );

			test( 'should dispatch keyring connections receive action when request completes', () => {
				return requestKeyringConnections()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: KEYRING_CONNECTIONS_RECEIVE,
						connections: [ { ID: 4306907 }, { ID: 7589550 } ],
					} );
				} );
			} );

			test( 'should dispatch keyring connections request success action when request completes', () => {
				return requestKeyringConnections()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: KEYRING_CONNECTIONS_REQUEST_SUCCESS,
					} );
				} );
			} );
		} );

		describe( 'failing requests', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/me/keyring-connections' )
					.reply( 500, {
						error: 'server_error',
						message: 'A server error occurred',
					} );
			} );

			test( 'should dispatch fetch action when thunk triggered', () => {
				requestKeyringConnections()( spy );

				expect( spy ).to.have.been.calledWith( {
					type: KEYRING_CONNECTIONS_REQUEST,
				} );
			} );

			test( 'should dispatch keyring connections request fail action when request fails', () => {
				return requestKeyringConnections()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: KEYRING_CONNECTIONS_REQUEST_FAILURE,
						error: sinon.match( { message: 'A server error occurred' } ),
					} );
				} );
			} );
		} );
	} );

	describe( 'deleteKeyringConnection()', () => {
		test( 'should dispatch delete action', () => {
			const action = deleteKeyringConnection( { ID: 2 } );

			expect( action ).to.eql( {
				type: KEYRING_CONNECTION_DELETE,
				connection: {
					ID: 2,
				},
			} );
		} );
	} );

	describe( 'deleteStoredKeyringConnection()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/me/keyring-connections/2/delete' )
				.reply( 200, {
					ID: 2,
					deleted: true,
				} )
				.post( '/rest/v1.1/me/keyring-connections/34/delete' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'You do not have permission to access this Keyring connection.',
				} );
		} );

		test( 'should dispatch delete action when request completes', () => {
			deleteStoredKeyringConnection( { ID: 2 } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: KEYRING_CONNECTION_DELETE,
					connection: {
						ID: 2,
					},
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			deleteStoredKeyringConnection( { ID: 34 } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: KEYRING_CONNECTION_DELETE_FAILURE,
					error: sinon.match( {
						message: 'You do not have permission to access this Keyring connection.',
					} ),
				} );
			} );
		} );
	} );
} );
