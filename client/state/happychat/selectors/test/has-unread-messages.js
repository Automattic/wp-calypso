/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import hasUnreadMessages from '../has-unread-messages';

// Simulate the time Feb 27, 2017 05:25 UTC
const NOW = 1488173100125;

describe( 'selectors', () => {
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
			expect( hasUnreadMessages( state ) ).toBeFalsy();
		} );

		test( 'returns false if there are no new messages since the Happychat was blurred', () => {
			const state = deepFreeze( {
				happychat: {
					chat: { timeline },
					ui: { lostFocusAt: NOW + ONE_MINUTE },
				},
			} );
			expect( hasUnreadMessages( state ) ).toBeFalsy();
		} );

		test( 'returns true if there are one or more messages after Happychat was blurred', () => {
			const state = deepFreeze( {
				happychat: {
					chat: { timeline },
					ui: { lostFocusAt: NOW - ONE_MINUTE - ONE_MINUTE },
				},
			} );
			expect( hasUnreadMessages( state ) ).toBeTruthy();
		} );
	} );
} );
