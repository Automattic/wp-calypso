/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import wasHappychatRecentlyActive from 'calypso/state/happychat/selectors/was-happychat-recently-active';

const TIME_SECOND = 1000;
const TIME_MINUTE = TIME_SECOND * 60;
const TIME_HOUR = TIME_MINUTE * 60;

// Simulate the time Feb 27, 2017 05:25 UTC
const NOW = 1488173100125;

describe( '#wasHappychatRecentlyActive()', () => {
	Date.now = jest.fn();
	Date.now.mockReturnValue( NOW );

	test( 'should return false if no activity', () => {
		const result = wasHappychatRecentlyActive( {
			happychat: {
				chat: { lastActivityTimestamp: null },
			},
		} );

		expect( result ).to.be.false;
	} );

	test( 'should return false if last activity was 3 hours ago', () => {
		const result = wasHappychatRecentlyActive( {
			happychat: {
				chat: { lastActivityTimestamp: NOW - TIME_HOUR * 3 },
			},
		} );

		expect( result ).to.be.false;
	} );

	test( 'should return true if last activity was 5 minutes ago', () => {
		const result = wasHappychatRecentlyActive( {
			happychat: {
				chat: { lastActivityTimestamp: NOW - TIME_MINUTE * 5 },
			},
		} );

		expect( result ).to.be.true;
	} );
} );
