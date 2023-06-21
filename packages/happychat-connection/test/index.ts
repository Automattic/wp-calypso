import { EventEmitter } from 'events';
// eslint-disable-next-line no-restricted-imports
import {
	receiveAccept,
	receiveConnect,
	receiveDisconnect,
	receiveError,
	receiveInit,
	receiveLocalizedSupport,
	receiveMessage,
	receiveMessageOptimistic,
	receiveMessageUpdate,
	receiveReconnecting,
	receiveStatus,
	receiveToken,
	receiveTranscript,
	receiveUnauthorized,
	requestTranscript,
	sendTyping,
} from 'calypso/state/happychat/connection/actions';
import { buildConnection } from '../src';
import { buildConnectionForCheckingAvailability } from '../src/connection';
import { HappychatAuth } from '../src/types';

const getConnection = ( { autoClose = false } = {} ) => {
	const options = {
		receiveAccept,
		receiveConnect,
		receiveDisconnect,
		receiveError,
		receiveInit,
		receiveLocalizedSupport,
		receiveMessage,
		receiveMessageOptimistic,
		receiveMessageUpdate,
		receiveReconnecting,
		receiveStatus,
		receiveToken,
		receiveUnauthorized,
		requestTranscript,
	};

	if ( autoClose ) {
		return buildConnectionForCheckingAvailability( options );
	}

	return buildConnection( options );
};

const buildUserData = () => {
	const signer_user_id = 12;
	const jwt = 'jwt';
	const skills = { language: [ '' ], product: [ '' ] };
	const groups = [ 'groups' ];
	const geoLocation = { country_short: '', country_long: '', region: '', city: '' };
	const fullUser = {
		ID: signer_user_id,
		language: '',
	};

	return {
		user: {
			signer_user_id,
			jwt,
			skills,
			groups,
			geoLocation,
		},
		fullUser,
	};
};

interface FixtureOptions {
	config: Promise< HappychatAuth >;
	autoClose?: boolean;
}

const setupFixture = ( options: FixtureOptions ) => {
	const { autoClose, config } = options;
	const dispatch = jest.fn();
	const connection = getConnection( { autoClose } );
	const openSocket = connection.init( dispatch, config );

	return {
		dispatch,
		connection,
		openSocket,
	};
};

describe( 'connection', () => {
	describe( 'init', () => {
		describe( 'should bind SocketIO events upon config promise resolution', () => {
			const userData = buildUserData();
			let socket;
			let dispatch;
			let openSocket;
			beforeEach( () => {
				socket = new EventEmitter();
				( { dispatch, openSocket } = setupFixture( {
					config: Promise.resolve( {
						url: socket,
						...userData,
					} ),
				} ) );
			} );

			test( 'connect event', () => {
				socket.emit( 'connect' );
				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith( receiveConnect() );
			} );

			test( 'token event', () => {
				const callback = jest.fn();
				const { signer_user_id, jwt, skills, groups } = userData.user;
				socket.emit( 'token', callback );
				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith( receiveToken() );
				expect( callback ).toHaveBeenCalledTimes( 1 );
				expect( callback ).toHaveBeenCalledWith( { signer_user_id, jwt, skills, groups } );
			} );

			test( 'init event', () => {
				const { signer_user_id, skills, groups, geoLocation } = userData.user;
				socket.emit( 'init' );
				expect( dispatch ).toHaveBeenCalledTimes( 2 );
				expect( dispatch.mock.calls[ 0 ][ 0 ] ).toEqual(
					receiveInit( { signer_user_id, skills, groups, geoLocation } )
				);
				expect( dispatch.mock.calls[ 1 ][ 0 ] ).toEqual( requestTranscript() );
				return expect( openSocket ).resolves.toBe( socket );
			} );

			test( 'unauthorized event', async () => {
				socket.close = jest.fn();
				socket.emit( 'unauthorized' );

				await expect( openSocket ).rejects.toBe( 'user is not authorized' );
				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith( receiveUnauthorized( 'User is not authorized' ) );
				expect( socket.close ).toHaveBeenCalled();
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
			let socket;
			let dispatch;
			let openSocket;
			const rejectMsg = 'no auth';
			beforeEach( () => {
				socket = new EventEmitter();
				( { dispatch, openSocket } = setupFixture( {
					config: Promise.reject( rejectMsg ),
				} ) );
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
		let socket;
		let dispatch;
		let connection;
		beforeEach( () => {
			socket = new EventEmitter();
			( { dispatch, connection } = setupFixture( {
				config: Promise.resolve( {
					url: socket,
					...buildUserData(),
				} ),
			} ) );
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

			test( 'and dispatch error if request was not successful', async () => {
				socket.emit( 'init' ); // resolve internal openSocket promise

				const action = requestTranscript( null );
				socket.on( action.event, ( payload, callback ) => {
					callback( 'no data', null ); // fake server responded with error
				} );

				await expect( () => connection.request( action, 100 ) ).rejects.toThrow( 'no data' );
				expect( dispatch ).toHaveBeenCalledWith(
					receiveError( action.event + ' request failed: no data' )
				);
			} );
		} );
	} );

	describe( 'when auth promise chain is rejected', () => {
		let socket;
		let dispatch;
		let connection;
		beforeEach( () => {
			socket = new EventEmitter();
			( { dispatch, connection } = setupFixture( {
				config: Promise.reject( 'no auth' ),
			} ) );
		} );

		test( 'connection.send should dispatch receiveError action', async () => {
			socket.emit = jest.fn();
			const action = sendTyping( 'content' );
			await expect( () => connection.send( action ) ).rejects.toBe( 'no auth' );
			expect( dispatch ).toHaveBeenCalledWith(
				receiveError( 'failed to send ' + action.event + ': no auth' )
			);
		} );

		test( 'connection.request should dispatch receiveError action', async () => {
			socket.emit = jest.fn();
			const action = requestTranscript( null );
			await expect( () => connection.request( action, 100 ) ).rejects.toBe( 'no auth' );
			expect( dispatch ).toHaveBeenCalledWith(
				receiveError( 'failed to send ' + action.event + ': no auth' )
			);
		} );
	} );
} );

describe( 'connection for checking availability', () => {
	let socket;
	let dispatch;
	let openSocket;

	beforeEach( () => {
		socket = new EventEmitter();
		( { dispatch, openSocket } = setupFixture( {
			autoClose: true,
			config: Promise.resolve( {
				url: socket,
				...buildUserData(),
			} ),
		} ) );
	} );

	test( 'unauthorized event and closing of connection', async () => {
		socket.close = jest.fn();
		socket.emit( 'unauthorized' );
		await expect( openSocket ).rejects.toBe( 'user is not authorized' );
		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith( receiveUnauthorized( 'User is not authorized' ) );
		expect( socket.close ).toHaveBeenCalled();
	} );

	// this is skipped because we don't close the connection on `accept` now, we need `status` as well
	test.skip( 'accept event and closing of connection', () => {
		socket.close = jest.fn();
		const isAvailable = true;
		socket.emit( 'accept', isAvailable );
		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith( receiveAccept( true ) );
		expect( socket.close ).toHaveBeenCalled();
	} );
} );
