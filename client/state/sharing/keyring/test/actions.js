/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	KEYRING_CONNECTION_DELETE,
	KEYRING_CONNECTIONS_RECEIVE,
	KEYRING_CONNECTIONS_REQUEST,
	KEYRING_CONNECTIONS_REQUEST_FAILURE,
	KEYRING_CONNECTIONS_REQUEST_SUCCESS,
} from 'state/action-types';
import { requestKeyringConnections, deleteKeyringConnection } from '../actions';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	describe( 'requestKeyringConnections()', () => {
		describe( 'successful requests', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/me/keyring-connections' )
					.reply( 200, {
						connections: [
							{ ID: 4306907 },
							{ ID: 7589550 },
						]
					} );
			} );

			it( 'should dispatch fetch action when thunk triggered', () => {
				requestKeyringConnections()( spy );

				expect( spy ).to.have.been.calledWith( {
					type: KEYRING_CONNECTIONS_REQUEST,
				} );
			} );

			it( 'should dispatch keyring connections receive action when request completes', () => {
				return requestKeyringConnections()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: KEYRING_CONNECTIONS_RECEIVE,
						connections: [
							{ ID: 4306907 },
							{ ID: 7589550 },
						]
					} );
				} );
			} );

			it( 'should dispatch keyring connections request success action when request completes', () => {
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

			it( 'should dispatch fetch action when thunk triggered', () => {
				requestKeyringConnections()( spy );

				expect( spy ).to.have.been.calledWith( {
					type: KEYRING_CONNECTIONS_REQUEST,
				} );
			} );

			it( 'should dispatch keyring connections request fail action when request fails', () => {
				return requestKeyringConnections()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: KEYRING_CONNECTIONS_REQUEST_FAILURE,
						error: sinon.match( { message: 'A server error occurred' } )
					} );
				} );
			} );
		} );
	} );

	describe( 'deleteKeyringConnection()', () => {
		it( 'should dispatch delete action', () => {
			deleteKeyringConnection( { ID: 2 } )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: KEYRING_CONNECTION_DELETE,
				connection: {
					ID: 2,
				},
			} );
		} );
	} );
} );
