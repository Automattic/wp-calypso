/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_CHAT_STATUS_ABANDONED,
	HAPPYCHAT_CHAT_STATUS_ASSIGNED,
	HAPPYCHAT_CHAT_STATUS_ASSIGNING,
	HAPPYCHAT_CHAT_STATUS_BLOCKED,
	HAPPYCHAT_CHAT_STATUS_CLOSED,
	HAPPYCHAT_CHAT_STATUS_DEFAULT,
	HAPPYCHAT_CHAT_STATUS_NEW,
	HAPPYCHAT_CHAT_STATUS_MISSED,
	HAPPYCHAT_CHAT_STATUS_PENDING,
} from 'state/happychat/constants';
import canUserSendMessages from '../can-user-send-messages';

describe( 'selectors', () => {
	describe( '#canUserSendMessages', () => {
		const messagingDisabledChatStatuses = [
			HAPPYCHAT_CHAT_STATUS_ABANDONED,
			HAPPYCHAT_CHAT_STATUS_BLOCKED,
			HAPPYCHAT_CHAT_STATUS_DEFAULT,
			HAPPYCHAT_CHAT_STATUS_MISSED,
			HAPPYCHAT_CHAT_STATUS_PENDING,
		];
		const messagingEnabledChatStatuses = [
			HAPPYCHAT_CHAT_STATUS_ASSIGNED,
			HAPPYCHAT_CHAT_STATUS_ASSIGNING,
			HAPPYCHAT_CHAT_STATUS_CLOSED,
			HAPPYCHAT_CHAT_STATUS_NEW,
		];

		it( 'should return false if Happychat is not connected', () => {
			const state = deepFreeze( {
				happychat: {
					connection: { status: 'uninitialized' },
					chat: { status: HAPPYCHAT_CHAT_STATUS_NEW },
				},
			} );
			expect( canUserSendMessages( state ) ).to.be.false;
		} );

		it( "should return false if Happychat is connected but the chat status doesn't allow messaging", () => {
			messagingDisabledChatStatuses.forEach( status => {
				const state = deepFreeze( {
					happychat: {
						connection: { status: 'connected' },
						chat: { status: status },
					},
				} );
				expect( canUserSendMessages( state ) ).to.be.false;
			} );
		} );

		it( 'should return true if Happychat is connected and the chat status allows messaging', () => {
			messagingEnabledChatStatuses.forEach( status => {
				const state = deepFreeze( {
					happychat: {
						connection: { status: 'connected' },
						chat: { status: status },
					},
				} );
				expect( canUserSendMessages( state ) ).to.be.true;
			} );
		} );

		it( 'should return true even when isAvailable is false', () => {
			// This test is here to prevent a code regression — isAvailable is supposed to
			// determine whether Happychat is capable of starting new chats, and should not be
			// a factor when determining if a user should be able to send messages to the service.
			const state = deepFreeze( {
				happychat: {
					connection: {
						status: 'connected',
						isAvailable: false,
					},
					chat: { status: HAPPYCHAT_CHAT_STATUS_NEW },
				},
			} );
			expect( canUserSendMessages( state ) ).to.be.true;
		} );
	} );
} );
