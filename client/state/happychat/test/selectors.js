/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import {
	getLostFocusTimestamp,
	hasUnreadMessages,
	wasHappychatRecentlyActive,
} from '../selectors';

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

	describe( '#getLostFocusTimestamp', () => {
		it( 'returns the current timestamp', () => {
			const state = { happychat: { lostFocusAt: NOW } };
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
			const state = {
				happychat: {
					timeline,
					lostFocusAt: null
				}
			};
			expect( hasUnreadMessages( state ) ).to.be.false;
		} );

		it( 'returns false if there are no new messages since the Happychat was blurred', () => {
			const state = {
				happychat: {
					timeline,
					lostFocusAt: NOW + ONE_MINUTE
				}
			};
			expect( hasUnreadMessages( state ) ).to.be.false;
		} );

		it( 'returns true if there are one or more messages after Happychat was blurred', () => {
			const state = {
				happychat: {
					timeline,
					lostFocusAt: NOW - ONE_MINUTE - ONE_MINUTE
				}
			};
			expect( hasUnreadMessages( state ) ).to.be.true;
		} );
	} );
} );
