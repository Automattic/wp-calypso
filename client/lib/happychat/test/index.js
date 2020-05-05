/**
 * External dependencies
 */
import { EventEmitter } from 'events';

/**
 * Internal dependencies
 */
import {
	receiveAccept,
	receiveConnect,
	receiveDisconnect,
	receiveError,
	receiveInit,
	receiveLocalizedSupport,
	receiveMessage,
	receiveReconnecting,
	receiveStatus,
	receiveToken,
	receiveTranscript,
	receiveTranscriptTimeout,
	receiveUnauthorized,
	requestTranscript,
	sendTyping,
} from 'state/happychat/connection/actions';
import buildConnection from '../connection';

describe( 'connection', () => {
	describe( 'init', () => {
		describe( 'should bind SockeIO events upon config promise resolution', () => {
			const signer_user_id = 12;
			const jwt = 'jwt';
			const locale = 'locale';
			const groups = 'groups';
			const geoLocation = 'location';

			let socket, dispatch, openSocket;
			beforeEach( () => {
				socket = new EventEmitter();
				dispatch = jest.fn();
				const connection = buildConnection();
				const config = Promise.resolve( {
					url: socket,
					user: {
						signer_user_id,
						jwt,
						locale,
						groups,
						geoLocation,
					},
				} );
				openSocket = connection.init( dispatch, config );
			} );

			test( 'connect event', () => {
				socket.emit( 'connect' );
				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith( receiveConnect() );
			} );

			test( 'token event', () => {
				const callback = jest.fn();
				socket.emit( 'token', callback );
				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith( receiveToken() );
				expect( callback ).toHaveBeenCalledTimes( 1 );
				expect( callback ).toHaveBeenCalledWith( { signer_user_id, jwt, locale, groups } );
			} );

			test( 'init event', () => {
				socket.emit( 'init' );
				expect( dispatch ).toHaveBeenCalledTimes( 2 );
				expect( dispatch.mock.calls[ 0 ][ 0 ] ).toEqual(
					receiveInit( { signer_user_id, locale, groups, geoLocation } )
				);
				expect( dispatch.mock.calls[ 1 ][ 0 ] ).toEqual( requestTranscript() );
				return expect( openSocket ).resolves.toBe( socket );
			} );

			test( 'unauthorized event', () => {
				socket.close = jest.fn();
				openSocket.catch( () => {
					expect( dispatch ).toHaveBeenCalledTimes( 1 );
					expect( dispatch ).toHaveBeenCalledWith(
						receiveUnauthorized( 'User is not authorized' )
					);
					expect( socket.close ).toHaveBeenCalled();
				} );
				socket.emit( 'unauthorized' );
			} );

			test( 'disconnect event', () => {
				const error = 'testing reasons';
				socket.emit( 'disconnect', error );
				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith( receiveDisconnect( error ) );
			} );

			test( 'reconnecting event', () => {
				socket.emit( 'reconnecting' );
				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith( receiveReconnecting() );
			} );

			test( 'status event', () => {
				const status = 'testing status';
				socket.emit( 'status', status );
				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith( receiveStatus( status ) );
			} );

			test( 'accept event', () => {
				const isAvailable = true;
				socket.emit( 'accept', isAvailable );
				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith( receiveAccept( isAvailable ) );
			} );

			test( 'localized-support event', () => {
				const isAvailable = true;
				socket.emit( 'localized-support', isAvailable );
				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith( receiveLocalizedSupport( isAvailable ) );
			} );

			test( 'message event', () => {
				const message = 'testing msg';
				socket.emit( 'message', message );
				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith( receiveMessage( message ) );
			} );
		} );

		describe( 'should not bind SocketIO events upon config promise rejection', () => {
			let connection, socket, dispatch, openSocket;
			const rejectMsg = 'no auth';
			beforeEach( () => {
				socket = new EventEmitter();
				dispatch = jest.fn();
				connection = buildConnection();
				openSocket = connection.init( dispatch, Promise.reject( rejectMsg ) );
			} );

			test( 'openSocket Promise has been rejected', () => {
				return expect( openSocket ).rejects.toBe( rejectMsg );
			} );

			test( 'connect event', () => {
				socket.emit( 'connect' );
				expect( dispatch ).toHaveBeenCalledTimes( 0 );
				// catch the promise to avoid the UnhandledPromiseRejectionWarning
				return expect( openSocket ).rejects.toBe( rejectMsg );
			} );

			test( 'token event', () => {
				const callback = jest.fn();
				socket.emit( 'token', callback );
				expect( dispatch ).toHaveBeenCalledTimes( 0 );
				expect( callback ).toHaveBeenCalledTimes( 0 );
				// catch the promise to avoid the UnhandledPromiseRejectionWarning
				return expect( openSocket ).rejects.toBe( rejectMsg );
			} );

			test( 'init event', () => {
				socket.emit( 'init' );
				expect( dispatch ).toHaveBeenCalledTimes( 0 );
				// catch the promise to avoid the UnhandledPromiseRejectionWarning
				return expect( openSocket ).rejects.toBe( rejectMsg );
			} );

			test( 'unauthorized event', () => {
				socket.close = jest.fn();
				socket.emit( 'unauthorized' );
				expect( dispatch ).toHaveBeenCalledTimes( 0 );
				// catch the promise to avoid the UnhandledPromiseRejectionWarning
				return expect( openSocket ).rejects.toBe( rejectMsg );
			} );

			test( 'disconnect event', () => {
				const error = 'testing reasons';
				socket.emit( 'disconnect', error );
				expect( dispatch ).toHaveBeenCalledTimes( 0 );
				// catch the promise to avoid the UnhandledPromiseRejectionWarning
				return expect( openSocket ).rejects.toBe( rejectMsg );
			} );

			test( 'reconnecting event', () => {
				socket.emit( 'reconnecting' );
				expect( dispatch ).toHaveBeenCalledTimes( 0 );
				// catch the promise to avoid the UnhandledPromiseRejectionWarning
				return expect( openSocket ).rejects.toBe( rejectMsg );
			} );

			test( 'status event', () => {
				const status = 'testing status';
				socket.emit( 'status', status );
				expect( dispatch ).toHaveBeenCalledTimes( 0 );
				// catch the promise to avoid the UnhandledPromiseRejectionWarning
				return expect( openSocket ).rejects.toBe( rejectMsg );
			} );

			test( 'accept event', () => {
				const isAvailable = true;
				socket.emit( 'accept', isAvailable );
				expect( dispatch ).toHaveBeenCalledTimes( 0 );
				// catch the promise to avoid the UnhandledPromiseRejectionWarning
				return expect( openSocket ).rejects.toBe( rejectMsg );
			} );

			test( 'message event', () => {
				const message = 'testing msg';
				socket.emit( 'message', message );
				expect( dispatch ).toHaveBeenCalledTimes( 0 );
				// catch the promise to avoid the UnhandledPromiseRejectionWarning
				return expect( openSocket ).rejects.toBe( rejectMsg );
			} );
		} );
	} );

	describe( 'when auth promise chain is fulfilled', () => {
		const signer_user_id = 12;
		const jwt = 'jwt';
		const locale = 'locale';
		const groups = 'groups';
		const geoLocation = 'location';

		let socket, dispatch, connection, config;
		beforeEach( () => {
			socket = new EventEmitter();
			dispatch = jest.fn();
			connection = buildConnection();
			config = Promise.resolve( {
				url: socket,
				user: {
					signer_user_id,
					jwt,
					locale,
					groups,
					geoLocation,
				},
			} );
			connection.init( dispatch, config );
		} );

		test( 'connection.send should emit a SocketIO event', () => {
			socket.emit( 'init' ); // resolve internal openSocket promise

			socket.emit = jest.fn();
			const action = sendTyping( 'my msg' );
			return connection.send( action ).then( () => {
				expect( socket.emit ).toHaveBeenCalledWith( action.event, action.payload );
			} );
		} );

		describe( 'connection.request should emit a SocketIO event', () => {
			test( 'and dispatch callbackTimeout if request ran out of time', () => {
				socket.emit( 'init' ); // resolve internal openSocket promise

				const action = requestTranscript( null );
				socket.emit = jest.fn();
				return connection.request( action, 100 ).catch( ( error ) => {
					expect( socket.emit ).toHaveBeenCalled();
					expect( socket.emit.mock.calls[ 0 ][ 0 ] ).toBe( action.event );
					expect( socket.emit.mock.calls[ 0 ][ 1 ] ).toBe( action.payload );
					expect( dispatch ).toHaveBeenCalledWith( receiveTranscriptTimeout() );
					expect( error.message ).toBe( 'timeout' );
				} );
			} );

			test( 'and dispatch callback if request responded successfully', () => {
				socket.emit( 'init' ); // resolve internal openSocket promise

				const action = requestTranscript( null );
				socket.on( action.event, ( payload, callback ) => {
					const result = {
						messages: [ 'msg1', 'msg2' ],
						timestamp: Date.now(),
					};
					callback( null, result ); // fake server responded ok
				} );
				return connection.request( action, 100 ).then( ( result ) => {
					expect( dispatch ).toHaveBeenCalledWith( receiveTranscript( result ) );
				} );
			} );

			test( 'and dispatch error if request was not successful', () => {
				socket.emit( 'init' ); // resolve internal openSocket promise

				const action = requestTranscript( null );
				socket.on( action.event, ( payload, callback ) => {
					callback( 'no data', null ); // fake server responded with error
				} );
				return connection.request( action, 100 ).catch( ( error ) => {
					expect( error.message ).toBe( 'no data' );
					expect( dispatch ).toHaveBeenCalledWith(
						receiveError( action.event + ' request failed: ' + error.message )
					);
				} );
			} );
		} );
	} );

	describe( 'when auth promise chain is rejected', () => {
		let socket, dispatch, connection, config;
		beforeEach( () => {
			socket = new EventEmitter();
			dispatch = jest.fn();
			connection = buildConnection();
			config = Promise.reject( 'no auth' );
			connection.init( dispatch, config );
		} );

		test( 'connection.send should dispatch receiveError action', () => {
			socket.emit = jest.fn();
			const action = sendTyping( 'content' );
			return connection.send( action ).catch( ( e ) => {
				expect( dispatch ).toHaveBeenCalledWith(
					receiveError( 'failed to send ' + action.event + ': ' + e )
				);
			} );
		} );

		test( 'connection.request should dispatch receiveError action', () => {
			socket.emit = jest.fn();
			const action = requestTranscript( null );
			return connection.request( action, 100 ).catch( ( e ) => {
				expect( dispatch ).toHaveBeenCalledWith(
					receiveError( 'failed to send ' + action.event + ': ' + e )
				);
			} );
		} );
	} );
} );
