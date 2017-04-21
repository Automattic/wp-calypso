/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { spy, stub } from 'sinon';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import wpcom from 'lib/wp';
import {
	HAPPYCHAT_CONNECTED,
	HAPPYCHAT_CONNECTING,
	HAPPYCHAT_DISCONNECTED,
	HAPPYCHAT_RECEIVE_EVENT,
	HAPPYCHAT_RECONNECTING,
	HAPPYCHAT_SEND_BROWSER_INFO,
	HAPPYCHAT_SEND_MESSAGE,
	HAPPYCHAT_SET_MESSAGE,
	HAPPYCHAT_SET_AVAILABLE,
	HAPPYCHAT_SET_CHAT_STATUS,
	HAPPYCHAT_TRANSCRIPT_RECEIVE,
	HAPPYCHAT_TRANSCRIPT_REQUEST,
} from 'state/action-types';
import middleware, {
	connectChat,
	connectIfRecentlyActive,
	requestTranscript,
	sendRouteSetEventMessage,
} from '../middleware';
import * as selectors from '../selectors';
import {
	HAPPYCHAT_CHAT_STATUS_ASSIGNED,
	HAPPYCHAT_CHAT_STATUS_PENDING,
} from '../selectors';

describe( 'middleware', () => {
	describe( 'HAPPYCHAT_CONNECT action', () => {
		// TODO: Add tests for cases outside the happy path
		let connection;
		let dispatch, getState;
		const uninitializedState = deepFreeze( {
			currentUser: { id: 1 },
			happychat: { connectionStatus: 'uninitialized' },
			users: { items: { 1: {} } }
		} );

		useSandbox( sandbox => {
			connection = {
				on: sandbox.stub(),
				open: sandbox.stub().returns( Promise.resolve() )
			};
			// Need to add return value after re-assignment, otherwise it will return
			// a reference to the previous (undefined) connection variable.
			connection.on.returns( connection );

			dispatch = sandbox.stub();
			getState = sandbox.stub();
			sandbox.stub( wpcom, 'request', ( args, callback ) => callback( null, {} ) );
		} );

		it( 'should not attempt to connect when Happychat has been initialized', () => {
			const connectedState = { happychat: { connectionStatus: 'connected' } };
			const connectingState = { happychat: { connectionStatus: 'connecting' } };

			return Promise.all( [
				connectChat( connection, { dispatch, getState: getState.returns( connectedState ) } ),
				connectChat( connection, { dispatch, getState: getState.returns( connectingState ) } ),
			] ).then( () => expect( connection.on ).not.to.have.been.called );
		} );

		describe( 'when Happychat is uninitialized', () => {
			before( () => {
				getState.returns( uninitializedState );
			} );

			it( 'should attempt to connect', () => {
				getState.returns( uninitializedState );
				return connectChat( connection, { dispatch, getState } )
					.then( () => {
						expect( connection.open ).to.have.been.calledOnce;
						expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_CONNECTING } );
					} );
			} );

			it( 'should set up listeners for various connection events', () => {
				return connectChat( connection, { dispatch, getState } )
					.then( () => {
						expect( connection.on.callCount ).to.equal( 6 );

						// Ensure 'connect' listener was connected by executing a fake message event
						connection.on.withArgs( 'connected' ).firstCall.args[ 1 ]( true );
						expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_CONNECTED } );
						expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_TRANSCRIPT_REQUEST } );

						// Ensure 'disconnect' listener was connected by executing a fake message event
						connection.on.withArgs( 'disconnect' ).firstCall.args[ 1 ]( 'abc' );
						expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_DISCONNECTED, errorStatus: 'abc' } );

						// Ensure 'reconnecting' listener was connected by executing a fake message event
						connection.on.withArgs( 'reconnecting' ).firstCall.args[ 1 ]();
						expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_RECONNECTING } );

						// Ensure 'accept' listener was connected by executing a fake message event
						connection.on.withArgs( 'accept' ).firstCall.args[ 1 ]( true );
						expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_SET_AVAILABLE, isAvailable: true } );

						// Ensure 'message' listener was connected by executing a fake message event
						connection.on.withArgs( 'message' ).firstCall.args[ 1 ]( 'some event' );
						expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_RECEIVE_EVENT, event: 'some event' } );

						// Ensure 'message' listener was connected by executing a fake message event
						connection.on.withArgs( 'status' ).firstCall.args[ 1 ]( 'ready' );
						expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_SET_CHAT_STATUS, status: 'ready' } );
					} );
			} );
		} );
	} );

	describe( 'HAPPYCHAT_SET_MESSAGE action', () => {
		it( 'should send relevant browser information to the connection', () => {
			const action = { type: HAPPYCHAT_SEND_BROWSER_INFO, siteUrl: 'http://butt.holdings/' };
			const connection = { info: spy() };
			middleware( connection )()( noop )( action );

			expect( connection.info ).to.have.been.calledOnce;
			expect( connection.info.firstCall.args[ 0 ].text ).to.include( action.siteUrl );
		} );
	} );

	describe( 'HAPPYCHAT_INITIALIZE action', () => {
		// TODO: This test is only complicated because connectIfRecentlyActive calls
		// connectChat directly, and since both are in the same module we can't stub
		// connectChat. So we need to build up all the objects to make connectChat execute
		// without errors. It may be worth pulling each of these helpers out into their
		// own modules, so that we can stub them and simplify our tests.
		const uninitializedState = deepFreeze( {
			currentUser: { id: 1 },
			happychat: { connectionStatus: 'uninitialized' },
			users: { items: { 1: {} } }
		} );
		let connection, store;

		useSandbox( sandbox => {
			sandbox.stub( selectors, 'wasHappychatRecentlyActive' );
			connection = {
				on: sandbox.stub()
			};
			// Need to add return value after re-assignment, otherwise it will return
			// a reference to the previous (undefined) connection variable.
			connection.on.returns( connection );
			store = {
				dispatch: noop,
				getState: sandbox.stub().returns( uninitializedState ),
			};
		} );

		it( 'should connect the chat if user was recently connected', () => {
			selectors.wasHappychatRecentlyActive.returns( true );
			connectIfRecentlyActive( connection, store );
			expect( connection.on ).to.have.been.called;
		} );

		it( 'should not connect the chat if user was not recently connected', () => {
			selectors.wasHappychatRecentlyActive.returns( false );
			connectIfRecentlyActive( connection, store );
			expect( connection.on ).not.to.have.been.called;
		} );
	} );

	describe( 'HAPPYCHAT_SEND_MESSAGE action', () => {
		it( 'should send the message through the connection and send a notTyping signal', () => {
			const action = { type: HAPPYCHAT_SEND_MESSAGE, message: 'Hello world' };
			const connection = {
				send: spy(),
				notTyping: spy(),
			};
			middleware( connection )()( noop )( action );
			expect( connection.send ).to.have.been.calledWith( action.message );
			expect( connection.notTyping ).to.have.been.calledOnce;
		} );
	} );

	describe( 'HAPPYCHAT_SET_MESSAGE action', () => {
		it( 'should send the connection a typing signal when a message is present', () => {
			const action = { type: HAPPYCHAT_SET_MESSAGE, message: 'Hello world' };
			const connection = { typing: spy() };
			middleware( connection )()( noop )( action );
			expect( connection.typing ).to.have.been.calledWith( action.message );
		} );
		it( 'should send the connection a notTyping signal when the message is blank', () => {
			const action = { type: HAPPYCHAT_SET_MESSAGE, message: '' };
			const connection = { notTyping: spy() };
			middleware( connection )()( noop )( action );
			expect( connection.notTyping ).to.have.been.calledOnce;
		} );
	} );

	describe( 'HAPPYCHAT_TRANSCRIPT_REQUEST action', () => {
		it( 'should fetch transcript from connection and dispatch receive action', () => {
			const state = deepFreeze( {
				happychat: {
					timeline: []
				}
			} );
			const response = {
				messages: [
					{ text: 'hello' }
				],
				timestamp: 100000,
			};

			const connection = { transcript: stub().returns( Promise.resolve( response ) ) };
			const dispatch = stub();
			const getState = stub().returns( state );

			return requestTranscript( connection, { getState, dispatch } )
				.then( () => {
					expect( connection.transcript ).to.have.been.called;

					expect( dispatch ).to.have.been.calledWith( {
						type: HAPPYCHAT_TRANSCRIPT_RECEIVE,
						...response,
					} );
				} );
		} );
	} );

	describe( 'ROUTE_SET action', () => {
		let connection;
		const action = { path: '/me' };
		const state = {
			currentUser: {
				id: '2'
			},
			users: {
				items: {
					2: { username: 'Link' }
				}
			},
			happychat: {
				connectionStatus: 'connected',
				isAvailable: true,
				chatStatus: HAPPYCHAT_CHAT_STATUS_ASSIGNED
			}
		};
		beforeEach( () => {
			connection = { sendEvent: stub() };
		} );
		it( 'should sent the page URL the user is in', () => {
			const getState = () => state;
			sendRouteSetEventMessage( connection, { getState }, action );
			expect( connection.sendEvent ).to.have.been.calledWith(
				'Looking at https://wordpress.com/me?support_user=Link'
			);
		} );
		it( 'should not sent the page URL the user is in when client not connected', () => {
			const getState = () => Object.assign( {},
				state,
				{ happychat: { connectionStatus: 'uninitialized' } }
			);
			sendRouteSetEventMessage( connection, { getState }, action );
			expect( connection.sendEvent ).to.not.have.been.called;
		} );
		it( 'should not sent the page URL the user is in when chat is not assigned', () => {
			const getState = () => Object.assign( {},
				state,
				{ happychat: { chatStatus: HAPPYCHAT_CHAT_STATUS_PENDING } }
			);
			sendRouteSetEventMessage( connection, { getState }, action );
			expect( connection.sendEvent ).to.not.have.been.called;
		} );
	} );
} );
