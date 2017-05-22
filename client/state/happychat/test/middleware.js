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
	ANALYTICS_EVENT_RECORD,
	HAPPYCHAT_BLUR,
	HAPPYCHAT_CONNECTED,
	HAPPYCHAT_CONNECTING,
	HAPPYCHAT_DISCONNECTED,
	HAPPYCHAT_RECEIVE_EVENT,
	HAPPYCHAT_RECONNECTING,
	HAPPYCHAT_SEND_USER_INFO,
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
	sendActionLogsAndEvents,
	sendAnalyticsLogEvent,
	sendRouteSetEventMessage,
	sendInfo,
} from '../middleware';
import * as selectors from '../selectors';
import {
	HAPPYCHAT_CHAT_STATUS_ASSIGNED,
	HAPPYCHAT_CHAT_STATUS_DEFAULT,
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

	describe( 'HAPPYCHAT_SEND_USER_INFO action', () => {
		const state = {
			happychat: {
				geoLocation: {
					city: 'Timisoara'
				}
			}
		};

		it( 'should send relevant browser information to the connection', () => {
			const getState = () => state;
			const connection = { info: spy() };
			const action = { type: HAPPYCHAT_SEND_USER_INFO, siteUrl: 'http://butt.holdings/' };
			sendInfo( connection, { getState }, action );

			expect( connection.info ).to.have.been.calledOnce;
			expect( connection.info.firstCall.args[ 0 ].text ).to.include( state.happychat.geoLocation.city );
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
			middleware( connection )( { getState: noop } )( noop )( action );
			expect( connection.send ).to.have.been.calledWith( action.message );
			expect( connection.notTyping ).to.have.been.calledOnce;
		} );
	} );

	describe( 'HAPPYCHAT_SET_MESSAGE action', () => {
		it( 'should send the connection a typing signal when a message is present', () => {
			const action = { type: HAPPYCHAT_SET_MESSAGE, message: 'Hello world' };
			const connection = { typing: spy() };
			middleware( connection )( { getState: noop } )( noop )( action );
			expect( connection.typing ).to.have.been.calledWith( action.message );
		} );
		it( 'should send the connection a notTyping signal when the message is blank', () => {
			const action = { type: HAPPYCHAT_SET_MESSAGE, message: '' };
			const connection = { notTyping: spy() };
			middleware( connection )( { getState: noop } )( noop )( action );
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

	describe( '#sendAnalyticsLogEvent', () => {
		let connection;

		useSandbox( sandbox => {
			connection = {
				sendLog: sandbox.stub(),
				sendStagingEvent: sandbox.stub(),
			};
		} );

		it( 'should ignore non-tracks analytics recordings', () => {
			const analyticsMeta = [
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'ga' } },
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'fb' } },
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'adwords' } },
			];
			sendAnalyticsLogEvent( connection, { meta: { analytics: analyticsMeta } } );

			expect( connection.sendLog ).not.to.have.been.called;
			expect( connection.sendStagingEvent ).not.to.have.been.called;
		} );

		it( 'should send log events for all listed tracks events', () => {
			const analyticsMeta = [
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'ga' } },
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'abc' } },
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'adwords' } },
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'def' } },
			];
			sendAnalyticsLogEvent( connection, { meta: { analytics: analyticsMeta } } );

			expect( connection.sendLog.callCount ).to.equal( 2 );
			expect( connection.sendLog ).to.have.been.calledWith( 'abc' );
			expect( connection.sendLog ).to.have.been.calledWith( 'def' );
		} );

		it( 'should only send a timeline event for whitelisted tracks events', () => {
			const analyticsMeta = [
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'calypso_add_new_wordpress_click' } },
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'abc' } },
				{ type: ANALYTICS_EVENT_RECORD, payload: {
					service: 'tracks', name: 'calypso_themeshowcase_theme_activate', properties: {}
				} },
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'def' } },
			];
			sendAnalyticsLogEvent( connection, { meta: { analytics: analyticsMeta } } );

			expect( connection.sendStagingEvent.callCount ).to.equal( 2 );
		} );
	} );

	describe( '#sendActionLogsAndEvents', () => {
		const assignedState = deepFreeze( {
			happychat: {
				connectionStatus: 'connected',
				chatStatus: HAPPYCHAT_CHAT_STATUS_ASSIGNED
			},
		} );
		const unassignedState = deepFreeze( {
			happychat: {
				connectionStatus: 'connected',
				chatStatus: HAPPYCHAT_CHAT_STATUS_DEFAULT
			},
		} );
		const unconnectedState = deepFreeze( {
			happychat: {
				connectionStatus: 'uninitialized',
				chatStatus: HAPPYCHAT_CHAT_STATUS_DEFAULT
			},
		} );

		let connection, getState;

		useSandbox( sandbox => {
			connection = {
				sendLog: sandbox.stub(),
				sendStagingEvent: sandbox.stub(),
			};

			getState = sandbox.stub();
		} );

		beforeEach( () => {
			getState.returns( assignedState );
		} );

		it( 'should not send events if there\'s no Happychat connection', () => {
			const action = {
				type: HAPPYCHAT_BLUR,
				meta: {
					analytics: [
						{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'abc' } },
					]
				}
			};
			getState.returns( unconnectedState );
			sendActionLogsAndEvents( connection, { getState }, action );

			expect( connection.sendLog ).not.to.have.been.called;
			expect( connection.sendStagingEvent ).not.to.have.been.called;
		} );

		it( 'should not send log events if the Happychat connection is unassigned', () => {
			const action = {
				type: HAPPYCHAT_BLUR,
				meta: {
					analytics: [
						{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'abc' } },
					]
				}
			};
			getState.returns( unassignedState );
			sendActionLogsAndEvents( connection, { getState }, action );

			expect( connection.sendLog ).not.to.have.been.called;
			expect( connection.sendStagingEvent ).not.to.have.been.called;
		} );

		it( 'should send matching events when Happychat is connected and assigned', () => {
			const action = {
				type: HAPPYCHAT_BLUR,
				meta: {
					analytics: [
						{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'calypso_add_new_wordpress_click' } },
						{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'abc' } },
						{ type: ANALYTICS_EVENT_RECORD, payload: {
							service: 'tracks', name: 'calypso_themeshowcase_theme_activate', properties: {}
						} },
						{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'def' } },
					]
				}
			};
			getState.returns( assignedState );
			sendActionLogsAndEvents( connection, { getState }, action );

			// All 4 analytics records will be sent to the "firehose" log
			expect( connection.sendLog.callCount ).to.equal( 4 );
			// The two whitelisted analytics events and the HAPPYCHAT_BLUR action itself
			// will be sent as customer events
			expect( connection.sendStagingEvent.callCount ).to.equal( 3 );
		} );
	} );
} );
