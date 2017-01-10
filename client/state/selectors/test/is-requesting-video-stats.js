/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingVideoStats } from '../';

describe( 'isRequestingVideoStats()', () => {
	it( 'should return false if the stat is not attached', () => {
		const state = {
			stats: {
				videos: {
					requesting: {
						2916284: {
							2454: true
						}
					}
				}
			}
		};
		const isRequesting = isRequestingVideoStats( state, 2916284, 2455 );

		expect( isRequesting ).to.be.false;
	} );

	it( 'should return false if the stat is not fetching', () => {
		const state = {
			stats: {
				videos: {
					requesting: {
						2916284: {
							2454: false
						}
					}
				}
			}
		};
		const isRequesting = isRequestingVideoStats( state, 2916284, 2454 );

		expect( isRequesting ).to.be.false;
	} );

	it( 'should return true if the site is fetching', () => {
		const state = {
			stats: {
				videos: {
					requesting: {
						2916284: {
							2454: true
						}
					}
				}
			}
		};
		const isRequesting = isRequestingVideoStats( state, 2916284, 2454 );

		expect( isRequesting ).to.be.true;
	} );
} );
