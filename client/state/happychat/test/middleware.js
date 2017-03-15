/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_TRANSCRIPT_RECEIVE,
} from 'state/action-types';
import {
	sendRouteSetEventMessage,
	requestTranscript,
} from '../middleware';

import {
	HAPPYCHAT_CONNECTION_STATUS_CONNECTED,
	HAPPYCHAT_CONNECTION_STATUS_DISCONNECTED,
	HAPPYCHAT_CHAT_STATUS_ASSIGNED,
	HAPPYCHAT_CHAT_STATUS_PENDING,
} from '../selectors';

describe( 'middleware', () => {
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
				connectionStatus: HAPPYCHAT_CONNECTION_STATUS_CONNECTED,
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
				{ happychat: { connectionStatus: HAPPYCHAT_CONNECTION_STATUS_DISCONNECTED } }
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
