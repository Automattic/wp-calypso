/**
 * External dependencies
 */
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
	HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED,
	HAPPYCHAT_CONNECTION_STATUS_CONNECTED,
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

		test( 'should return false if Happychat is not connected', () => {
			const state = deepFreeze( {
				happychat: {
					connection: { status: HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED },
					chat: { status: HAPPYCHAT_CHAT_STATUS_NEW },
				},
			} );
			expect( canUserSendMessages( state ) ).toBeFalsy();
		} );

		test( "should return false if Happychat is connected but the chat status doesn't allow messaging", () => {
			messagingDisabledChatStatuses.forEach( ( status ) => {
				const state = deepFreeze( {
					happychat: {
						connection: { status: HAPPYCHAT_CONNECTION_STATUS_CONNECTED },
						chat: { status },
					},
				} );
				expect( canUserSendMessages( state ) ).toBeFalsy();
			} );
		} );

		test( 'should return true if Happychat is connected and the chat status allows messaging', () => {
			messagingEnabledChatStatuses.forEach( ( status ) => {
				const state = deepFreeze( {
					happychat: {
						connection: { status: HAPPYCHAT_CONNECTION_STATUS_CONNECTED },
						chat: { status },
					},
				} );
				expect( canUserSendMessages( state ) ).toBeTruthy();
			} );
		} );

		test( 'should return true even when isAvailable is false', () => {
			// This test is here to prevent a code regression — isAvailable is supposed to
			// determine whether Happychat is capable of starting new chats, and should not be
			// a factor when determining if a user should be able to send messages to the service.
			const state = deepFreeze( {
				happychat: {
					connection: { status: HAPPYCHAT_CONNECTION_STATUS_CONNECTED },
					chat: { status: HAPPYCHAT_CHAT_STATUS_NEW },
					isAvailable: false,
				},
			} );
			expect( canUserSendMessages( state ) ).toBeTruthy();
		} );
	} );
} );
