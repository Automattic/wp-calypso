/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { noop } from 'lodash';
import moment from 'moment';
import { spy, stub } from 'sinon';

/**
 * Internal dependencies
 */
import middleware, {
	sendActionLogsAndEvents,
	sendAnalyticsLogEvent,
	sendRouteSetEventMessage,
	updateChatPreferences,
	sendInfo,
} from '../middleware';
import {
	HAPPYCHAT_CHAT_STATUS_ASSIGNED,
	HAPPYCHAT_CHAT_STATUS_DEFAULT,
	HAPPYCHAT_CHAT_STATUS_PENDING,
	HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED,
	HAPPYCHAT_CONNECTION_STATUS_CONNECTED,
} from '../constants';
import {
	ANALYTICS_EVENT_RECORD,
	HAPPYCHAT_BLUR,
	HAPPYCHAT_SEND_USER_INFO,
	HAPPYCHAT_SEND_MESSAGE,
	HAPPYCHAT_SET_CURRENT_MESSAGE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'middleware', () => {
	describe( 'HAPPYCHAT_SEND_USER_INFO action', () => {
		const state = {
			happychat: {
				user: {
					geoLocation: {
						city: 'Timisoara',
					},
				},
			},
		};

		const previousWindow = global.window;
		const previousScreen = global.screen;
		const previousNavigator = global.navigator;

		beforeAll( () => {
			global.window = {
				innerWidth: 'windowInnerWidth',
				innerHeight: 'windowInnerHeight',
			};
			global.screen = {
				width: 'screenWidth',
				height: 'screenHeight',
			};
			global.navigator = {
				userAgent: 'navigatorUserAgent',
			};
		} );

		afterAll( () => {
			global.window = previousWindow;
			global.screen = previousScreen;
			global.navigator = previousNavigator;
		} );

		test( 'should send relevant browser information to the connection', () => {
			const expectedInfo = {
				howCanWeHelp: 'howCanWeHelp',
				howYouFeel: 'howYouFeel',
				siteId: 'siteId',
				siteUrl: 'siteUrl',
				localDateTime: moment().format( 'h:mm a, MMMM Do YYYY' ),
				screenSize: {
					width: 'screenWidth',
					height: 'screenHeight',
				},
				browserSize: {
					width: 'windowInnerWidth',
					height: 'windowInnerHeight',
				},
				userAgent: 'navigatorUserAgent',
				geoLocation: state.happychat.user.geoLocation,
			};

			const getState = () => state;
			const connection = { sendInfo: spy() };
			const action = {
				type: HAPPYCHAT_SEND_USER_INFO,
				site: {
					ID: 'siteId',
					URL: 'siteUrl',
				},
				howCanWeHelp: 'howCanWeHelp',
				howYouFeel: 'howYouFeel',
			};
			sendInfo( connection, { getState }, action );

			expect( connection.sendInfo ).to.have.been.calledOnce;
			expect( connection.sendInfo ).to.have.been.calledWithMatch( expectedInfo );
		} );
	} );

	describe( 'HAPPYCHAT_SEND_MESSAGE action', () => {
		test( 'should send the message through the connection and send a notTyping signal', () => {
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

	describe( 'HAPPYCHAT_SET_CURRENT_MESSAGE action', () => {
		test( 'should send the connection a typing signal when a message is present', () => {
			const action = { type: HAPPYCHAT_SET_CURRENT_MESSAGE, message: 'Hello world' };
			const connection = { typing: spy() };
			middleware( connection )( { getState: noop } )( noop )( action );
			expect( connection.typing ).to.have.been.calledWith( action.message );
		} );
		test( 'should send the connection a notTyping signal when the message is blank', () => {
			const action = { type: HAPPYCHAT_SET_CURRENT_MESSAGE, message: '' };
			const connection = { notTyping: spy() };
			middleware( connection )( { getState: noop } )( noop )( action );
			expect( connection.notTyping ).to.have.been.calledOnce;
		} );
	} );

	describe( 'HELP_CONTACT_FORM_SITE_SELECT action', () => {
		test( 'should send the locale and groups through the connection and send a preferences signal', () => {
			const state = {
				happychat: {
					connection: { status: HAPPYCHAT_CONNECTION_STATUS_CONNECTED },
				},
				currentUser: {
					locale: 'en',
					capabilities: {},
				},
				sites: {
					items: {
						1: { ID: 1 },
					},
				},
				ui: {
					section: {
						name: 'reader',
					},
				},
			};
			const getState = () => state;
			const connection = {
				setPreferences: stub(),
			};
			updateChatPreferences( connection, { getState }, 1 );
			expect( connection.setPreferences ).to.have.been.called;
		} );

		test( 'should not send the locale and groups if there is no happychat connection', () => {
			const state = {
				currentUser: {
					locale: 'en',
					capabilities: {},
				},
				sites: {
					items: {
						1: { ID: 1 },
					},
				},
			};
			const getState = () => state;
			const connection = {
				setPreferences: stub(),
			};
			updateChatPreferences( connection, { getState }, 1 );
			expect( connection.setPreferences ).to.have.not.been.called;
		} );
	} );

	describe( 'ROUTE_SET action', () => {
		let connection;
		const action = { path: '/me' };
		const state = {
			currentUser: {
				id: '2',
			},
			users: {
				items: {
					2: { username: 'Link' },
				},
			},
			happychat: {
				connection: {
					status: HAPPYCHAT_CONNECTION_STATUS_CONNECTED,
					isAvailable: true,
				},
				chat: { status: HAPPYCHAT_CHAT_STATUS_ASSIGNED },
			},
		};

		beforeEach( () => {
			connection = { sendEvent: stub() };
		} );

		test( 'should sent the page URL the user is in', () => {
			const getState = () => state;
			sendRouteSetEventMessage( connection, { getState }, action );
			expect( connection.sendEvent ).to.have.been.calledWith(
				'Looking at https://wordpress.com/me?support_user=Link'
			);
		} );

		test( 'should not sent the page URL the user is in when client not connected', () => {
			const getState = () =>
				Object.assign( {}, state, {
					happychat: { connection: { status: HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED } },
				} );
			sendRouteSetEventMessage( connection, { getState }, action );
			expect( connection.sendEvent ).to.not.have.been.called;
		} );

		test( 'should not sent the page URL the user is in when chat is not assigned', () => {
			const getState = () =>
				Object.assign( {}, state, {
					happychat: { chat: { status: HAPPYCHAT_CHAT_STATUS_PENDING } },
				} );
			sendRouteSetEventMessage( connection, { getState }, action );
			expect( connection.sendEvent ).to.not.have.been.called;
		} );
	} );

	describe( '#sendAnalyticsLogEvent', () => {
		let connection;

		useSandbox( sandbox => {
			connection = {
				sendLog: sandbox.stub(),
				sendEvent: sandbox.stub(),
			};
		} );

		test( 'should ignore non-tracks analytics recordings', () => {
			const analyticsMeta = [
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'ga' } },
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'fb' } },
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'adwords' } },
			];
			sendAnalyticsLogEvent( connection, { meta: { analytics: analyticsMeta } } );

			expect( connection.sendLog ).not.to.have.been.called;
			expect( connection.sendEvent ).not.to.have.been.called;
		} );

		test( 'should send log events for all listed tracks events', () => {
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

		test( 'should only send a timeline event for whitelisted tracks events', () => {
			const analyticsMeta = [
				{
					type: ANALYTICS_EVENT_RECORD,
					payload: { service: 'tracks', name: 'calypso_add_new_wordpress_click' },
				},
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'abc' } },
				{
					type: ANALYTICS_EVENT_RECORD,
					payload: {
						service: 'tracks',
						name: 'calypso_themeshowcase_theme_activate',
						properties: {},
					},
				},
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'def' } },
			];
			sendAnalyticsLogEvent( connection, { meta: { analytics: analyticsMeta } } );

			expect( connection.sendEvent.callCount ).to.equal( 2 );
		} );
	} );

	describe( '#sendActionLogsAndEvents', () => {
		const assignedState = deepFreeze( {
			happychat: {
				connection: { status: HAPPYCHAT_CONNECTION_STATUS_CONNECTED },
				chat: { status: HAPPYCHAT_CHAT_STATUS_ASSIGNED },
			},
		} );
		const unassignedState = deepFreeze( {
			happychat: {
				connection: { status: HAPPYCHAT_CONNECTION_STATUS_CONNECTED },
				chat: { status: HAPPYCHAT_CHAT_STATUS_DEFAULT },
			},
		} );
		const unconnectedState = deepFreeze( {
			happychat: {
				connection: { status: HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED },
				chat: { status: HAPPYCHAT_CHAT_STATUS_DEFAULT },
			},
		} );

		let connection, getState;

		useSandbox( sandbox => {
			connection = {
				sendLog: sandbox.stub(),
				sendEvent: sandbox.stub(),
			};

			getState = sandbox.stub();
		} );

		beforeEach( () => {
			getState.returns( assignedState );
		} );

		test( "should not send events if there's no Happychat connection", () => {
			const action = {
				type: HAPPYCHAT_BLUR,
				meta: {
					analytics: [
						{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'abc' } },
					],
				},
			};
			getState.returns( unconnectedState );
			sendActionLogsAndEvents( connection, { getState }, action );

			expect( connection.sendLog ).not.to.have.been.called;
			expect( connection.sendEvent ).not.to.have.been.called;
		} );

		test( 'should not send log events if the Happychat connection is unassigned', () => {
			const action = {
				type: HAPPYCHAT_BLUR,
				meta: {
					analytics: [
						{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'abc' } },
					],
				},
			};
			getState.returns( unassignedState );
			sendActionLogsAndEvents( connection, { getState }, action );

			expect( connection.sendLog ).not.to.have.been.called;
			expect( connection.sendEvent ).not.to.have.been.called;
		} );

		test( 'should send matching events when Happychat is connected and assigned', () => {
			const action = {
				type: HAPPYCHAT_BLUR,
				meta: {
					analytics: [
						{
							type: ANALYTICS_EVENT_RECORD,
							payload: { service: 'tracks', name: 'calypso_add_new_wordpress_click' },
						},
						{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'abc' } },
						{
							type: ANALYTICS_EVENT_RECORD,
							payload: {
								service: 'tracks',
								name: 'calypso_themeshowcase_theme_activate',
								properties: {},
							},
						},
						{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'def' } },
					],
				},
			};
			getState.returns( assignedState );
			sendActionLogsAndEvents( connection, { getState }, action );

			// All 4 analytics records will be sent to the "firehose" log
			expect( connection.sendLog.callCount ).to.equal( 4 );
			// The two whitelisted analytics events and the HAPPYCHAT_BLUR action itself
			// will be sent as customer events
			expect( connection.sendEvent.callCount ).to.equal( 3 );
		} );
	} );
} );
