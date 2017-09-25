/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { HAPPYCHAT_GROUP_WPCOM, HAPPYCHAT_GROUP_JPOP } from '../constants';
import { HAPPYCHAT_CHAT_STATUS_ABANDONED, HAPPYCHAT_CHAT_STATUS_ASSIGNED, HAPPYCHAT_CHAT_STATUS_ASSIGNING, HAPPYCHAT_CHAT_STATUS_BLOCKED, HAPPYCHAT_CHAT_STATUS_CLOSED, HAPPYCHAT_CHAT_STATUS_DEFAULT, HAPPYCHAT_CHAT_STATUS_NEW, HAPPYCHAT_CHAT_STATUS_MISSED, HAPPYCHAT_CHAT_STATUS_PENDING, canUserSendMessages, getLostFocusTimestamp, hasUnreadMessages, hasActiveHappychatSession, isHappychatAvailable, wasHappychatRecentlyActive, getGeoLocation, getGroups } from '../selectors';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import { userState } from 'state/selectors/test/fixtures/user-state';
import { useSandbox } from 'test/helpers/use-sinon';

const TIME_SECOND = 1000;
const TIME_MINUTE = TIME_SECOND * 60;
const TIME_HOUR = TIME_MINUTE * 60;

// Simulate the time Feb 27, 2017 05:25 UTC
const NOW = 1488173100125;

describe( 'selectors', () => {
	describe( '#wasHappychatRecentlyActive()', () => {
		useSandbox( sandbox => {
			sandbox.stub( Date, 'now' ).returns( NOW );
		} );

		it( 'should return false if no activity', () => {
			const result = wasHappychatRecentlyActive( {
				happychat: {
					lastActivityTimestamp: null
				}
			} );

			expect( result ).to.be.false;
		} );

		it( 'should return false if last activity was 3 hours ago', () => {
			const result = wasHappychatRecentlyActive( {
				happychat: {
					lastActivityTimestamp: NOW - ( TIME_HOUR * 3 )
				}
			} );

			expect( result ).to.be.false;
		} );

		it( 'should return true if last activity was 5 minutes ago', () => {
			const result = wasHappychatRecentlyActive( {
				happychat: {
					lastActivityTimestamp: NOW - ( TIME_MINUTE * 5 )
				}
			} );

			expect( result ).to.be.true;
		} );
	} );

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
					connectionStatus: 'uninitialized',
					chatStatus: HAPPYCHAT_CHAT_STATUS_NEW
				}
			} );
			expect( canUserSendMessages( state ) ).to.be.false;
		} );

		it( "should return false if Happychat is connected but the chat status doesn't allow messaging", () => {
			messagingDisabledChatStatuses.forEach( status => {
				const state = deepFreeze( {
					happychat: {
						connectionStatus: 'connected',
						chatStatus: status
					}
				} );
				expect( canUserSendMessages( state ) ).to.be.false;
			} );
		} );

		it( 'should return true if Happychat is connected and the chat status allows messaging', () => {
			messagingEnabledChatStatuses.forEach( status => {
				const state = deepFreeze( {
					happychat: {
						connectionStatus: 'connected',
						chatStatus: status
					}
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
					connectionStatus: 'connected',
					chatStatus: HAPPYCHAT_CHAT_STATUS_NEW,
					isAvailable: false,
				}
			} );
			expect( canUserSendMessages( state ) ).to.be.true;
		} );
	} );

	describe( '#getLostFocusTimestamp', () => {
		it( 'returns the current timestamp', () => {
			const state = deepFreeze( { happychat: { lostFocusAt: NOW } } );
			expect( getLostFocusTimestamp( state ) ).to.eql( NOW );
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
			{ timestamp: ( NOW ) / 1000 },
		];

		it( 'returns false if Happychat is focused', () => {
			const state = deepFreeze( {
				happychat: {
					timeline,
					lostFocusAt: null
				}
			} );
			expect( hasUnreadMessages( state ) ).to.be.false;
		} );

		it( 'returns false if there are no new messages since the Happychat was blurred', () => {
			const state = deepFreeze( {
				happychat: {
					timeline,
					lostFocusAt: NOW + ONE_MINUTE
				}
			} );
			expect( hasUnreadMessages( state ) ).to.be.false;
		} );

		it( 'returns true if there are one or more messages after Happychat was blurred', () => {
			const state = deepFreeze( {
				happychat: {
					timeline,
					lostFocusAt: NOW - ONE_MINUTE - ONE_MINUTE
				}
			} );
			expect( hasUnreadMessages( state ) ).to.be.true;
		} );
	} );

	describe( '#hasActiveHappychatSession', () => {
		const inactiveChatStatuses = [
			HAPPYCHAT_CHAT_STATUS_BLOCKED,
			HAPPYCHAT_CHAT_STATUS_CLOSED,
			HAPPYCHAT_CHAT_STATUS_DEFAULT,
			HAPPYCHAT_CHAT_STATUS_NEW,
		];
		const activeChatStatuses = [
			HAPPYCHAT_CHAT_STATUS_ABANDONED,
			HAPPYCHAT_CHAT_STATUS_ASSIGNED,
			HAPPYCHAT_CHAT_STATUS_ASSIGNING,
			HAPPYCHAT_CHAT_STATUS_MISSED,
			HAPPYCHAT_CHAT_STATUS_PENDING,
		];

		it( 'should be false when chatStatus indicates the user has no active session', () => {
			inactiveChatStatuses.forEach( status => {
				const state = deepFreeze( { happychat: { chatStatus: status } } );
				expect( hasActiveHappychatSession( state ) ).to.be.false;
			} );
		} );

		it( 'should be true when chatStatus indicates the user has an active session', () => {
			activeChatStatuses.forEach( status => {
				const state = deepFreeze( { happychat: { chatStatus: status } } );
				expect( hasActiveHappychatSession( state ) ).to.be.true;
			} );
		} );
	} );

	describe( '#isHappychatAvailable', () => {
		it( "should be false if there's no active connection", () => {
			const state = deepFreeze( {
				happychat: {
					connectionStatus: 'uninitialized',
					isAvailable: true
				}
			} );
			expect( isHappychatAvailable( state ) ).to.be.false;
		} );

		it( "should be false if Happychat isn't accepting new connections", () => {
			const state = deepFreeze( {
				happychat: {
					connectionStatus: 'connected',
					isAvailable: false
				}
			} );
			expect( isHappychatAvailable( state ) ).to.be.false;
		} );

		it( "should be true when there's a connection and connections are being accepted", () => {
			const state = deepFreeze( {
				happychat: {
					connectionStatus: 'connected',
					isAvailable: true
				}
			} );
			expect( isHappychatAvailable( state ) ).to.be.true;
		} );
	} );

	describe( 'getGeoLocation', () => {
		it( 'should return null if geoLocation is not set', () => {
			const selected = getGeoLocation( {
				happychat: {
					geoLocation: null
				}
			} );
			expect( selected ).to.equal( null );
		} );
		it( 'should return value if geoLocation is set', () => {
			const selected = getGeoLocation( {
				happychat: {
					geoLocation: {
						city: 'Timisoara'
					}
				}
			} );
			expect( selected.city ).to.equal( 'Timisoara' );
		} );
	} );

	describe( '#getGroups()', () => {
		let _window; // Keep a copy of the original window if any

		beforeEach( () => {
			_window = global.window;
			global.window = {};
		} );

		afterEach( () => {
			global.window = _window;
		} );

		it( 'should return default group for no sites', () => {
			const siteId = 1;
			const state = {
				...userState,
				sites: {
					items: {}
				}
			};

			expect( getGroups( state, siteId ) ).to.eql( [ HAPPYCHAT_GROUP_WPCOM ] );
		} );

		it( 'should return default group for no siteId', () => {
			const siteId = undefined;
			const state = {
				...userState,
				sites: {
					items: {
						1: {}
					}
				}
			};

			expect( getGroups( state, siteId ) ).to.eql( [ HAPPYCHAT_GROUP_WPCOM ] );
		} );

		it( 'should return JPOP group for jetpack paid sites', () => {
			const siteId = 1;
			const state = {
				...userState,
				currentUser: {
					id: 1,
					capabilities: {
						[ siteId ]: {
							manage_options: true
						}
					}
				},
				sites: {
					items: {
						[ siteId ]: {
							jetpack: true,
							plan: {
								product_id: 2005,
								product_slug: 'jetpack_personal'
							}
						}
					}
				}
			};

			expect( getGroups( state, siteId ) ).to.eql( [ HAPPYCHAT_GROUP_JPOP ] );
		} );

		it( 'should return WPCOM for AT sites group for jetpack site', () => {
			const siteId = 1;
			const state = {
				...userState,
				currentUser: {
					id: 1,
					capabilities: {
						[ siteId ]: {
							manage_options: true
						}
					}
				},
				sites: {
					items: {
						[ siteId ]: {
							jetpack: true,
							options: { is_automated_transfer: true },
							plan: { product_slug: PLAN_BUSINESS }
						}
					}
				}
			};

			expect( getGroups( state, siteId ) ).to.eql( [ HAPPYCHAT_GROUP_WPCOM ] );
		} );
	} );
} );
