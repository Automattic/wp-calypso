/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { HAPPYCHAT_GROUP_WPCOM, HAPPYCHAT_GROUP_JPOP } from '../constants';
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
import { canUserSendMessages, hasUnreadMessages, getGroups } from '../selectors';
import { isEnabled } from 'config';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import { userState } from 'state/selectors/test/fixtures/user-state';

// Simulate the time Feb 27, 2017 05:25 UTC
const NOW = 1488173100125;

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
					connection: { status: 'uninitialized' },
					chat: { status: HAPPYCHAT_CHAT_STATUS_NEW },
				},
			} );
			expect( canUserSendMessages( state ) ).to.be.false;
		} );

		test( "should return false if Happychat is connected but the chat status doesn't allow messaging", () => {
			messagingDisabledChatStatuses.forEach( status => {
				const state = deepFreeze( {
					happychat: {
						connection: { status: 'connected' },
						chat: { status },
					},
				} );
				expect( canUserSendMessages( state ) ).to.be.false;
			} );
		} );

		test( 'should return true if Happychat is connected and the chat status allows messaging', () => {
			messagingEnabledChatStatuses.forEach( status => {
				const state = deepFreeze( {
					happychat: {
						connection: { status: 'connected' },
						chat: { status },
					},
				} );
				expect( canUserSendMessages( state ) ).to.be.true;
			} );
		} );

		test( 'should return true even when isAvailable is false', () => {
			// This test is here to prevent a code regression — isAvailable is supposed to
			// determine whether Happychat is capable of starting new chats, and should not be
			// a factor when determining if a user should be able to send messages to the service.
			const state = deepFreeze( {
				happychat: {
					connection: { status: 'connected' },
					chat: { status: HAPPYCHAT_CHAT_STATUS_NEW },
					isAvailable: false,
				},
			} );
			expect( canUserSendMessages( state ) ).to.be.true;
		} );
	} );

	describe( '#hasUnreadMessages', () => {
		const ONE_MINUTE = 1000 * 60;
		const FIVE_MINUTES = ONE_MINUTE * 5;

		// Need to convert timestamps to seconds, instead of milliseconds, because
		// that's what the Happychat service provides
		const timeline = [
			{ timestamp: ( NOW - FIVE_MINUTES ) / 1000 },
			{ timestamp: ( NOW - ONE_MINUTE ) / 1000 },
			{ timestamp: NOW / 1000 },
		];

		test( 'returns false if Happychat is focused', () => {
			const state = deepFreeze( {
				happychat: {
					chat: { timeline },
					ui: { lostFocusAt: null },
				},
			} );
			expect( hasUnreadMessages( state ) ).to.be.false;
		} );

		test( 'returns false if there are no new messages since the Happychat was blurred', () => {
			const state = deepFreeze( {
				happychat: {
					chat: { timeline },
					ui: { lostFocusAt: NOW + ONE_MINUTE },
				},
			} );
			expect( hasUnreadMessages( state ) ).to.be.false;
		} );

		test( 'returns true if there are one or more messages after Happychat was blurred', () => {
			const state = deepFreeze( {
				happychat: {
					chat: { timeline },
					ui: { lostFocusAt: NOW - ONE_MINUTE - ONE_MINUTE },
				},
			} );
			expect( hasUnreadMessages( state ) ).to.be.true;
		} );
	} );

	describe( '#getGroups()', () => {
		let _window; // Keep a copy of the original window if any
		const uiState = {
			ui: {
				section: {
					name: 'reader',
				},
			},
		};

		beforeEach( () => {
			_window = global.window;
			global.window = {};
		} );

		afterEach( () => {
			global.window = _window;
		} );

		test( 'should return default group for no sites', () => {
			const siteId = 1;
			const state = {
				...uiState,
				...userState,
				sites: {
					items: {},
				},
			};

			expect( getGroups( state, siteId ) ).to.eql( [ HAPPYCHAT_GROUP_WPCOM ] );
		} );

		test( 'should return default group for no siteId', () => {
			const siteId = undefined;
			const state = {
				...uiState,
				...userState,
				sites: {
					items: {
						1: {},
					},
				},
			};

			expect( getGroups( state, siteId ) ).to.eql( [ HAPPYCHAT_GROUP_WPCOM ] );
		} );

		test( 'should return JPOP group for jetpack paid sites', () => {
			const siteId = 1;
			const state = {
				...uiState,
				...userState,
				currentUser: {
					id: 1,
					capabilities: {
						[ siteId ]: {
							manage_options: true,
						},
					},
				},
				sites: {
					items: {
						[ siteId ]: {
							jetpack: true,
							plan: {
								product_id: 2005,
								product_slug: 'jetpack_personal',
							},
						},
					},
				},
			};

			expect( getGroups( state, siteId ) ).to.eql( [ HAPPYCHAT_GROUP_JPOP ] );
		} );

		test( 'should return WPCOM for AT sites group for jetpack site', () => {
			const siteId = 1;
			const state = {
				...uiState,
				...userState,
				currentUser: {
					id: 1,
					capabilities: {
						[ siteId ]: {
							manage_options: true,
						},
					},
				},
				sites: {
					items: {
						[ siteId ]: {
							jetpack: true,
							options: { is_automated_transfer: true },
							plan: { product_slug: PLAN_BUSINESS },
						},
					},
				},
			};

			expect( getGroups( state, siteId ) ).to.eql( [ HAPPYCHAT_GROUP_WPCOM ] );
		} );

		if ( isEnabled( 'jetpack/happychat' ) ) {
			test( 'should return JPOP group if within the jetpackConnect section', () => {
				const state = {
					...userState,
					sites: {
						items: {
							1: {},
						},
					},
					ui: {
						section: {
							name: 'jetpackConnect',
						},
					},
				};

				expect( getGroups( state ) ).to.eql( [ HAPPYCHAT_GROUP_JPOP ] );
			} );
		} else {
			test.skip( 'should not return JPOP group if within the jetpackConnect section' );
		}
	} );
} );
