/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getNotices } from '../selectors';

describe( 'selectors', () => {
	describe( 'getNotices()', () => {
		beforeEach( () => {
			getNotices.memoizedSelector.cache.clear();
		} );

		it( 'should return an array of notices', () => {
			const notices = getNotices( {
				notices: {
					items: {
						1: { noticeId: 1 },
						2: { noticeId: 2 },
						3: { noticeId: 3 }
					}
				}
			} );

			expect( notices ).to.eql( [
				{ noticeId: 1 },
				{ noticeId: 2 },
				{ noticeId: 3 }
			] );
		} );
	} );
} );
