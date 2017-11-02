/** @format */

/**
 * Internal dependencies
 */
import { socketMiddleware as middleware } from '../middleware';
import {
	initConnection,
	requestTranscript,
	sendEvent,
	sendLog,
	sendMessage,
	sendUserInfo,
	sendPreferences,
	sendTyping,
	sendNotTyping,
} from 'state/happychat/connection/actions';
import { blur } from 'state/happychat/ui/actions';
import {
	HAPPYCHAT_CHAT_STATUS_ASSIGNED,
	HAPPYCHAT_CHAT_STATUS_NEW,
	HAPPYCHAT_CONNECTION_STATUS_CONNECTED,
	HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED,
} from 'state/happychat/constants';

describe( 'middleware', () => {
	let actionMiddleware, connection, store;
	beforeEach( () => {
		connection = {
			init: jest.fn(),
			send: jest.fn(),
			request: jest.fn(),
		};

		store = {
			getState: jest.fn(),
			dispatch: jest.fn(),
		};

		actionMiddleware = middleware( connection )( store )( jest.fn() );
	} );

	describe( 'connection.init actions are connected', () => {
		test( 'HAPPYCHAT_IO_INIT', () => {
			const action = initConnection( jest.fn() );
			actionMiddleware( action );
			expect( connection.init ).toHaveBeenCalledWith( store.dispatch, action.auth );
		} );
	} );

	describe( 'connection.send actions are connected', () => {
		test( 'HAPPYCHAT_IO_SEND_MESSAGE_EVENT', () => {
			const action = sendEvent( 'msg' );
			actionMiddleware( action );
			expect( connection.send ).toHaveBeenCalledWith( action );
		} );

		test( 'HAPPYCHAT_IO_SEND_MESSAGE_LOG', () => {
			const action = sendLog( 'msg' );
			actionMiddleware( action );
			expect( connection.send ).toHaveBeenCalledWith( action );
		} );

		test( 'HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE', () => {
			const action = sendMessage( 'msg' );
			actionMiddleware( action );
			expect( connection.send ).toHaveBeenCalledWith( action );
		} );

		test( 'HAPPYCHAT_IO_SEND_MESSAGE_USERINFO', () => {
			const action = sendUserInfo( { user: 'user' } );
			actionMiddleware( action );
			expect( connection.send ).toHaveBeenCalledWith( action );
		} );

		test( 'HAPPYCHAT_IO_SEND_MESSAGE_PREFERENCES', () => {
			const action = sendPreferences( 'locale', [] );
			actionMiddleware( action );
			expect( connection.send ).toHaveBeenCalledWith( action );
		} );

		test( 'HAPPYCHAT_IO_SEND_MESSAGE_TYPING (sendTyping)', () => {
			const action = sendTyping( 'msg' );
			actionMiddleware( action );
			expect( connection.send ).toHaveBeenCalledWith( action );
		} );

		test( 'HAPPYCHAT_IO_SEND_MESSAGE_TYPING (sendNotTyping)', () => {
			const action = sendNotTyping( 'msg' );
			actionMiddleware( action );
			expect( connection.send ).toHaveBeenCalledWith( action );
		} );
	} );

	describe( 'connection.request actions are connected', () => {
		test( 'HAPPYCHAT_IO_REQUEST_TRANSCRIPT', () => {
			const action = requestTranscript( 20, 30 );
			actionMiddleware( action );
			expect( connection.request ).toHaveBeenCalledWith( action, action.timeout );
		} );
	} );

	describe( 'eventMessage', () => {
		test( 'is dispatched if client is connected and chat is assigned', () => {
			const state = {
				happychat: {
					connection: {
						status: HAPPYCHAT_CONNECTION_STATUS_CONNECTED,
					},
					chat: {
						status: HAPPYCHAT_CHAT_STATUS_ASSIGNED,
					},
				},
			};
			store.getState.mockReturnValue( state );
			const action = blur();
			actionMiddleware( action );
			expect( store.dispatch.mock.calls[ 0 ][ 0 ].event ).toBe( 'message' );
			expect( store.dispatch.mock.calls[ 0 ][ 0 ].payload.text ).toBe(
				'Stopped looking at Happychat'
			);
		} );

		test( 'is not dispatched is client is not connected', () => {
			const state = {
				happychat: {
					connection: {
						status: HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED,
					},
					chat: {
						status: HAPPYCHAT_CHAT_STATUS_ASSIGNED,
					},
				},
			};
			store.getState.mockReturnValue( state );
			const action = blur();
			actionMiddleware( action );
			expect( store.dispatch ).not.toHaveBeenCalled();
		} );

		test( 'is not dispatched if chat is not assigned', () => {
			const state = {
				happychat: {
					connection: {
						status: HAPPYCHAT_CONNECTION_STATUS_CONNECTED,
					},
					chat: {
						status: HAPPYCHAT_CHAT_STATUS_NEW,
					},
				},
			};
			store.getState.mockReturnValue( state );
			const action = blur();
			actionMiddleware( action );
			expect( store.dispatch ).not.toHaveBeenCalled();
		} );
	} );
} );
