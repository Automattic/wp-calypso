/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import middleware, {
	sendActionLogsAndEvents,
	sendAnalyticsLogEvent,
	getEventMessageFromTracksData,
} from '../middleware-calypso';
import getSkills from 'state/happychat/selectors/get-skills';
import { selectSiteId } from 'state/help/actions';
import { setRoute } from 'state/ui/actions';
import { getCurrentUserLocale } from 'state/current-user/selectors';
import getGroups from 'state/happychat/selectors/get-groups';
import { sendPreferences } from 'state/happychat/connection/actions';
import {
	HAPPYCHAT_CHAT_STATUS_ASSIGNED,
	HAPPYCHAT_CHAT_STATUS_DEFAULT,
	HAPPYCHAT_CHAT_STATUS_PENDING,
	HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED,
	HAPPYCHAT_CONNECTION_STATUS_CONNECTED,
	HAPPYCHAT_CONNECTION_STATUS_DISCONNECTED,
} from 'state/happychat/constants';
import {
	ANALYTICS_EVENT_RECORD,
	HAPPYCHAT_IO_SEND_MESSAGE_EVENT,
	HAPPYCHAT_IO_SEND_MESSAGE_LOG,
	SITE_SETTINGS_SAVE_SUCCESS,
} from 'state/action-types';

describe( 'middleware', () => {
	let actionMiddleware, store;
	beforeEach( () => {
		store = {
			getState: jest.fn(),
			dispatch: jest.fn(),
		};

		actionMiddleware = middleware( store )( jest.fn() );
	} );

	describe( 'Calypso actions are converted to SocketIO actions', () => {
		describe( 'HELP_CONTACT_FORM_SITE_SELECT', () => {
			test( 'should dispatch a sendPreferences action if happychat client is connected', () => {
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
				store.getState.mockReturnValue( state );
				const action = selectSiteId( state.sites.items[ 1 ].ID );
				actionMiddleware( action );
				expect( store.dispatch ).toHaveBeenCalledWith(
					sendPreferences(
						getCurrentUserLocale( state ),
						getGroups( state, action.siteId ),
						getSkills( state, action.siteId )
					)
				);
			} );

			test( 'should not dispatch a sendPreferences action if there is no happychat connection', () => {
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
				store.getState.mockReturnValue( state );
				const action = selectSiteId( state.sites.items[ 1 ].ID );
				actionMiddleware( action );
				expect( store.dispatch ).not.toHaveBeenCalled();
			} );
		} );

		describe( 'ROUTE_SET', () => {
			const action = setRoute( '/me' );

			let state;
			beforeEach( () => {
				state = {
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

				store.getState.mockReturnValue( state );
			} );

			test( 'should dispatch a sendEvent action if client connected and chat assigned', () => {
				actionMiddleware( action );
				expect( store.dispatch.mock.calls[ 0 ][ 0 ].payload.text ).toBe(
					'Looking at https://wordpress.com/me?support_user=Link'
				);
			} );

			test( 'should not dispatch a sendEvent action if client is not connected', () => {
				state.happychat.connection.status = HAPPYCHAT_CONNECTION_STATUS_DISCONNECTED;
				actionMiddleware( action );
				expect( store.dispatch ).not.toHaveBeenCalled();
			} );

			test( 'should not dispatch a sendEvent action if chat is not assigned', () => {
				state.happychat.chat.status = HAPPYCHAT_CHAT_STATUS_PENDING;
				actionMiddleware( action );
				expect( store.dispatch ).not.toHaveBeenCalled();
			} );
		} );
	} );

	describe( '#sendAnalyticsLogEvent', () => {
		test( 'should ignore non-tracks analytics recordings', () => {
			const analyticsMeta = [
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'ga' } },
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'fb' } },
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'adwords' } },
			];
			sendAnalyticsLogEvent( store.dispatch, { meta: { analytics: analyticsMeta } } );

			expect( store.dispatch ).not.toHaveBeenCalled();
		} );

		test( 'should send log events for all listed tracks events', () => {
			const analyticsMeta = [
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'ga' } },
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'abc' } },
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'adwords' } },
				{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'def' } },
			];
			sendAnalyticsLogEvent( store.dispatch, { meta: { analytics: analyticsMeta } } );

			expect( store.dispatch ).toHaveBeenCalledTimes( 2 );
			expect( store.dispatch.mock.calls[ 0 ][ 0 ].payload.text ).toBe( 'abc' );
			expect( store.dispatch.mock.calls[ 1 ][ 0 ].payload.text ).toBe( 'def' );
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
			sendAnalyticsLogEvent( store.dispatch, { meta: { analytics: analyticsMeta } } );

			expect( store.dispatch.mock.calls[ 0 ][ 0 ].type ).toBe( HAPPYCHAT_IO_SEND_MESSAGE_EVENT );
			expect( store.dispatch.mock.calls[ 1 ][ 0 ].type ).toBe( HAPPYCHAT_IO_SEND_MESSAGE_LOG );
			expect( store.dispatch.mock.calls[ 2 ][ 0 ].type ).toBe( HAPPYCHAT_IO_SEND_MESSAGE_LOG );
			expect( store.dispatch.mock.calls[ 3 ][ 0 ].type ).toBe( HAPPYCHAT_IO_SEND_MESSAGE_EVENT );
			expect( store.dispatch.mock.calls[ 4 ][ 0 ].type ).toBe( HAPPYCHAT_IO_SEND_MESSAGE_LOG );
			expect( store.dispatch.mock.calls[ 5 ][ 0 ].type ).toBe( HAPPYCHAT_IO_SEND_MESSAGE_LOG );

			expect( store.dispatch ).toHaveBeenCalledTimes( 6 );
			expect( store.dispatch.mock.calls[ 0 ][ 0 ].payload.text ).toBe(
				getEventMessageFromTracksData( analyticsMeta[ 0 ].payload )
			);
			expect( store.dispatch.mock.calls[ 3 ][ 0 ].payload.text ).toBe(
				getEventMessageFromTracksData( analyticsMeta[ 2 ].payload )
			);
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

		test( "should not send events if there's no Happychat connection", () => {
			const action = {
				type: SITE_SETTINGS_SAVE_SUCCESS,
				meta: {
					analytics: [
						{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'abc' } },
					],
				},
			};
			store.getState.mockReturnValue( unconnectedState );
			sendActionLogsAndEvents( store, action );

			expect( store.dispatch ).not.toHaveBeenCalled();
		} );

		test( 'should not send log events if the Happychat connection is unassigned', () => {
			const action = {
				type: SITE_SETTINGS_SAVE_SUCCESS,
				meta: {
					analytics: [
						{ type: ANALYTICS_EVENT_RECORD, payload: { service: 'tracks', name: 'abc' } },
					],
				},
			};
			store.getState.mockReturnValue( unassignedState );
			sendActionLogsAndEvents( store, action );

			expect( store.dispatch ).not.toHaveBeenCalled();
		} );

		test( 'should send matching events when Happychat is connected and assigned', () => {
			const action = {
				type: SITE_SETTINGS_SAVE_SUCCESS,
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
			store.getState.mockReturnValue( assignedState );
			sendActionLogsAndEvents( store, action );

			// All 4 analytics records will be sent to the "firehose" log
			// The two whitelisted analytics events and the SITE_SETTINGS_SAVE_SUCCESS itself
			// will be sent as customer events
			expect( store.dispatch ).toHaveBeenCalledTimes( 7 );
			expect( store.dispatch.mock.calls[ 0 ][ 0 ].type ).toBe( HAPPYCHAT_IO_SEND_MESSAGE_EVENT );
			expect( store.dispatch.mock.calls[ 1 ][ 0 ].type ).toBe( HAPPYCHAT_IO_SEND_MESSAGE_LOG );
			expect( store.dispatch.mock.calls[ 2 ][ 0 ].type ).toBe( HAPPYCHAT_IO_SEND_MESSAGE_LOG );
			expect( store.dispatch.mock.calls[ 3 ][ 0 ].type ).toBe( HAPPYCHAT_IO_SEND_MESSAGE_EVENT );
			expect( store.dispatch.mock.calls[ 4 ][ 0 ].type ).toBe( HAPPYCHAT_IO_SEND_MESSAGE_LOG );
			expect( store.dispatch.mock.calls[ 5 ][ 0 ].type ).toBe( HAPPYCHAT_IO_SEND_MESSAGE_LOG );
			expect( store.dispatch.mock.calls[ 6 ][ 0 ].type ).toBe( HAPPYCHAT_IO_SEND_MESSAGE_EVENT );
		} );
	} );
} );
