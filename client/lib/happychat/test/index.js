/**
 * External dependencies
 */
import { expect } from 'chai';
import { stub } from 'sinon';
import { EventEmitter } from 'events';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_CONNECTING,
	HAPPYCHAT_CONNECTED,
	HAPPYCHAT_DISCONNECTED,
	HAPPYCHAT_RECEIVE_EVENT,
	HAPPYCHAT_RECONNECTING,
	HAPPYCHAT_SET_AVAILABLE,
	HAPPYCHAT_SET_CHAT_STATUS,
	HAPPYCHAT_TRANSCRIPT_REQUEST,
} from 'state/action-types';

import buildConnection from '../connection';

describe( 'connection', ( ) => {
	describe( 'should bind socket ', ( ) => {
		const user = {
			signer_user_id: 12,
			jwt: 'jwt',
			locale: 'locale',
			groups: 'groups',
			geo_location: 'location',
		};

		let openSocket, socket, dispatch;
		beforeEach( () => {
			socket = new EventEmitter();
			dispatch = stub();
			const connection = buildConnection();
			openSocket = connection.init( socket, dispatch, user );
		} );

		it( 'connect event', ( done ) => {
			openSocket.then( ( ) => {
				// TODO: implement when connect event is used
				expect( true ).to.equal( true );
				done(); // tell mocha the promise chain ended
			} );
			socket.emit( 'connect' );
			socket.emit( 'init' ); // force openSocket promise to resolve
		} );

		it( 'token event', ( done ) => {
			const callback = stub();
			openSocket.then( ( ) => {
				expect( callback.getCall( 0 ).args[ 0 ].signer_user_id ).to.equal( user.signer_user_id );
				expect( callback.getCall( 0 ).args[ 0 ].jwt ).to.equal( user.jwt );
				expect( callback.getCall( 0 ).args[ 0 ].locale ).to.equal( user.locale );
				expect( callback.getCall( 0 ).args[ 0 ].groups ).to.equal( user.groups );
				done(); // tell mocha the promise chain ended
			} );
			socket.emit( 'token', callback );
			socket.emit( 'init' ); // force openSocket promise to resolve
		} );

		it( 'init event', ( done ) => {
			openSocket.then( ( ) => {
				expect( dispatch.getCall( 0 ).args[ 0 ].type ).to.equal( HAPPYCHAT_CONNECTING );
				expect( dispatch.getCall( 1 ).args[ 0 ].type ).to.equal( HAPPYCHAT_CONNECTED );
				expect( dispatch.getCall( 1 ).args[ 0 ].user.signer_user_id ).to.equal( user.signer_user_id );
				expect( dispatch.getCall( 1 ).args[ 0 ].user.locale ).to.equal( user.locale );
				expect( dispatch.getCall( 1 ).args[ 0 ].user.groups ).to.equal( user.groups );
				expect( dispatch.getCall( 1 ).args[ 0 ].user.geo_location ).to.equal( user.geo_location );
				expect( dispatch.getCall( 2 ).args[ 0 ].type ).to.equal( HAPPYCHAT_TRANSCRIPT_REQUEST );
				done(); // tell mocha the promise chain ended
			} );
			socket.emit( 'init' ); // force openSocket promise to resolve
		} );

		it( 'unauthorized event', ( done ) => {
			socket.close = stub().returns( ()=>{} );
			openSocket.then( ( ) => {
				expect( socket.close ).to.have.been.called;
				done(); // tell mocha the promise chain ended
			} );
			socket.emit( 'init' ); // force openSocket promise to resolve
			socket.emit( 'unauthorized' );
		} );

		it( 'disconnect event', ( done ) => {
			const errorReason = 'testing reasons';
			openSocket.then( ( ) => {
				expect( dispatch.getCall( 3 ).args[ 0 ].type ).to.equal( HAPPYCHAT_DISCONNECTED );
				expect( dispatch.getCall( 3 ).args[ 0 ].errorStatus ).to.equal( errorReason );
				done(); // tell mocha the promise chain ended
			} );
			socket.emit( 'init' ); // force openSocket promise to resolve
			socket.emit( 'disconnect', errorReason );
		} );

		it( 'reconnecting event', ( done ) => {
			openSocket.then( ( ) => {
				expect( dispatch.getCall( 3 ).args[ 0 ].type ).to.equal( HAPPYCHAT_RECONNECTING );
				done(); // tell mocha the promise chain ended
			} );
			socket.emit( 'init' ); // force openSocket promise to resolve
			socket.emit( 'reconnecting' );
		} );

		it( 'status event', ( done ) => {
			const status = 'testing status';
			openSocket.then( ( ) => {
				expect( dispatch.getCall( 3 ).args[ 0 ].type ).to.equal( HAPPYCHAT_SET_CHAT_STATUS );
				expect( dispatch.getCall( 3 ).args[ 0 ].status ).to.equal( status );
				done(); // tell mocha the promise chain ended
			} );
			socket.emit( 'init' ); // force openSocket promise to resolve
			socket.emit( 'status', status );
		} );

		it( 'accept event', ( done ) => {
			const accept = true;
			openSocket.then( ( ) => {
				expect( dispatch.getCall( 3 ).args[ 0 ].type ).to.equal( HAPPYCHAT_SET_AVAILABLE );
				expect( dispatch.getCall( 3 ).args[ 0 ].isAvailable ).to.equal( accept );
				done(); // tell mocha the promise chain ended
			} );
			socket.emit( 'init' ); // force openSocket promise to resolve
			socket.emit( 'accept', accept );
		} );

		it( 'message event', ( done ) => {
			const message = 'testing msg';
			openSocket.then( ( ) => {
				expect( dispatch.getCall( 3 ).args[ 0 ].type ).to.equal( HAPPYCHAT_RECEIVE_EVENT );
				expect( dispatch.getCall( 3 ).args[ 0 ].event ).to.equal( message );
				done(); // tell mocha the promise chain ended
			} );
			socket.emit( 'init' ); // force openSocket promise to resolve
			socket.emit( 'message', message );
		} );
	} );
} );
