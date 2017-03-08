/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isHappychatRecentlyActive
} from '../selectors';

const TIME_SECOND = 1000;
const TIME_MINUTE = TIME_SECOND * 60;
const TIME_HOUR = TIME_MINUTE * 60;

// Simulate the current time (Feb 27, 2017 05:25 UTC)
const NOW = 1488173100125;

describe( 'selectors', () => {
	describe( '#isHappychatRecentlyActive()', () => {
		it( 'should return false if no activity', () => {
			const result = isHappychatRecentlyActive( {
				happychat: {
					lastActivity: null
				}
			}, NOW );

			expect( result ).to.be.false;
		} );

		it( 'should return false if last activity was 3 hours ago', () => {
			const result = isHappychatRecentlyActive( {
				happychat: {
					lastActivity: NOW - ( TIME_HOUR * 3 )
				}
			}, NOW );

			expect( result ).to.be.false;
		} );

		it( 'should return true if last activity was 5 minutes ago', () => {
			const result = isHappychatRecentlyActive( {
				happychat: {
					lastActivity: NOW - ( TIME_MINUTE * 5 )
				}
			}, NOW );

			expect( result ).to.be.true;
		} );

		it( 'should return false if last activity is in the future', () => {
			const result = isHappychatRecentlyActive( {
				happychat: {
					lastActivity: NOW + TIME_MINUTE
				}
			}, NOW );

			expect( result ).to.be.false;
		} );
	} );
} );
