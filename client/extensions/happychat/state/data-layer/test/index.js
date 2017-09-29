/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';

import {
	ANALYTICS_EVENT_RECORD,
} from 'state/action-types';
import {
	HAPPYCHAT_BLUR
} from 'extensions/happychat/state/action-types';
import {
	HAPPYCHAT_CHAT_STATUS_ASSIGNED,
	HAPPYCHAT_CHAT_STATUS_DEFAULT,
} from 'extensions/happychat/state/selectors';
import {
	sendActionLogsAndEvents,
	sendAnalyticsLogEvent,
} from '../middleware';

describe( 'middleware', () => {
	describe( '#sendAnalyticsLogEvent', () => {
		let connection;

		useSandbox( sandbox => {
			connection = {
				sendLog: sandbox.stub(),
				sendEvent: sandbox.stub(),
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
			expect( connection.sendEvent ).not.to.have.been.called;
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

			expect( connection.sendEvent.callCount ).to.equal( 2 );
		} );
	} );

	describe( '#sendActionLogsAndEvents', () => {
		const assignedState = deepFreeze( {
			extensions: {
				happychat: {
					connectionStatus: 'connected',
					chatStatus: HAPPYCHAT_CHAT_STATUS_ASSIGNED
				}
			},
		} );
		const unassignedState = deepFreeze( {
			extensions: {
				happychat: {
					connectionStatus: 'connected',
					chatStatus: HAPPYCHAT_CHAT_STATUS_DEFAULT
				}
			},
		} );
		const unconnectedState = deepFreeze( {
			extensions: {
				happychat: {
					connectionStatus: 'uninitialized',
					chatStatus: HAPPYCHAT_CHAT_STATUS_DEFAULT
				}
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
			expect( connection.sendEvent ).not.to.have.been.called;
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
			expect( connection.sendEvent ).not.to.have.been.called;
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
			expect( connection.sendEvent.callCount ).to.equal( 2 );
		} );
	} );
} );
