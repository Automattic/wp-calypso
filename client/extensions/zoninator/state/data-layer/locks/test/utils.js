/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { fromApi } from '../utils';

describe( 'utils', () => {
	describe( '#fromApi()', () => {
		test( 'should parse expiration time and maximum lock period into milliseconds', () => {
			const response = {
				data: {
					timeout: 30,
					max_lock_period: 600,
				},
			};
			const now = new Date().getTime();
			const lock = fromApi( response );

			expect( lock ).to.have.keys( [ 'expires', 'maxLockPeriod' ] );
			expect( lock.maxLockPeriod ).to.deep.equal( 600000 );
			expect( lock.expires ).to.be.within( now + 30000, now + 31000 );
		} );
	} );
} );
