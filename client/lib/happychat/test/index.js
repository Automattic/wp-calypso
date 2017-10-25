/** @format */
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

describe( 'connection', () => {
	describe( 'should bind socket ', () => {
		const signer_user_id = 12;
		const jwt = 'jwt';
		const locale = 'locale';
		const groups = 'groups';
		const geoLocation = 'location';

		let openSocket, socket, dispatch;
		beforeEach( () => {
			socket = new EventEmitter();
			dispatch = stub();
			const connection = buildConnection();
			openSocket = connection.init( socket, dispatch, {
				signer_user_id,
				jwt,
				locale,
				groups,
				geoLocation,
			} );
		} );

		it( 'connect event', done => {
			openSocket.then( () => {
				// TODO: implement when connect event is used
				expect( true ).to.equal( true );
				done(); // tell mocha the promise chain ended
			} );
			socket.emit( 'connect' );
			socket.emit( 'init' ); // force openSocket promise to resolve
		} );

		it( 'token event', done => {
			const callback = stub();
			openSocket.then( () => {
				expect( callback ).to.have.been.calledWithMatch( { signer_user_id, jwt, locale, groups } );
				done(); // tell mocha the promise chain ended
			} );
			socket.emit( 'token', callback );
			socket.emit( 'init' ); // force openSocket promise to resolve
		} );

		it( 'init event', done => {
			openSocket.then( () => {
				expect( dispatch.getCall( 0 ) ).to.have.been.calledWithMatch( {
					type: HAPPYCHAT_CONNECTING,
				} );
				expect( dispatch.getCall( 1 ) ).to.have.been.calledWithMatch( {
					type: HAPPYCHAT_CONNECTED,
					user: { signer_user_id, locale, groups, geoLocation },
				} );
				expect( dispatch.getCall( 2 ) ).to.have.been.calledWithMatch( {
					type: HAPPYCHAT_TRANSCRIPT_REQUEST,
				} );
				done(); // tell mocha the promise chain ended
			} );
			socket.emit( 'init' ); // force openSocket promise to resolve
		} );

		it( 'unauthorized event', done => {
			socket.close = stub().returns( () => {} );
			openSocket.then( () => {
				expect( socket.close ).to.have.been.called;
				done(); // tell mocha the promise chain ended
			} );
			socket.emit( 'init' ); // force openSocket promise to resolve
			socket.emit( 'unauthorized' );
		} );

		it( 'disconnect event', done => {
			const errorStatus = 'testing reasons';
			openSocket.then( () => {
				expect( dispatch.getCall( 3 ) ).to.have.been.calledWithMatch( {
					type: HAPPYCHAT_DISCONNECTED,
					errorStatus,
				} );
				done(); // tell mocha the promise chain ended
			} );
			socket.emit( 'init' ); // force openSocket promise to resolve
			socket.emit( 'disconnect', errorStatus );
		} );

		it( 'reconnecting event', done => {
			openSocket.then( () => {
				expect( dispatch.getCall( 3 ) ).to.have.been.calledWithMatch( {
					type: HAPPYCHAT_RECONNECTING,
				} );
				done(); // tell mocha the promise chain ended
			} );
			socket.emit( 'init' ); // force openSocket promise to resolve
			socket.emit( 'reconnecting' );
		} );

		it( 'status event', done => {
			const status = 'testing status';
			openSocket.then( () => {
				expect( dispatch.getCall( 3 ) ).to.have.been.calledWithMatch( {
					type: HAPPYCHAT_SET_CHAT_STATUS,
					status,
				} );
				done(); // tell mocha the promise chain ended
			} );
			socket.emit( 'init' ); // force openSocket promise to resolve
			socket.emit( 'status', status );
		} );

		it( 'accept event', done => {
			const isAvailable = true;
			openSocket.then( () => {
				expect( dispatch.getCall( 3 ) ).to.have.been.calledWithMatch( {
					type: HAPPYCHAT_SET_AVAILABLE,
					isAvailable,
				} );
				done(); // tell mocha the promise chain ended
			} );
			socket.emit( 'init' ); // force openSocket promise to resolve
			socket.emit( 'accept', isAvailable );
		} );

		it( 'message event', done => {
			const event = 'testing msg';
			openSocket.then( () => {
				expect( dispatch.getCall( 3 ) ).to.have.been.calledWithMatch( {
					type: HAPPYCHAT_RECEIVE_EVENT,
					event,
				} );
				done(); // tell mocha the promise chain ended
			} );
			socket.emit( 'init' ); // force openSocket promise to resolve
			socket.emit( 'message', event );
		} );
	} );
} );
