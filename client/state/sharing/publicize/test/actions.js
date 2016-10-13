/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	PUBLICIZE_CONNECTIONS_REQUEST,
	PUBLICIZE_CONNECTIONS_RECEIVE,
	PUBLICIZE_CONNECTIONS_REQUEST_FAILURE
} from 'state/action-types';
import {
	fetchConnections,
	receiveConnections,
	failConnectionsRequest
} from '../actions';
import useNock from 'test/helpers/use-nock';

describe( '#fetchConnections()', () => {
	const spy = sinon.spy();

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

	beforeEach( () => {
		spy.reset();
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
