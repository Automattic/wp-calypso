/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getVideoStats } from '../';

describe( 'getVideoStats()', () => {
	it( 'should return null if the site is not tracked', () => {
		const state = {
			stats: {
				videos: {
					items: {
						2916284: {
							2454: [ [ '2016-11-11', 1 ], [ '2016-11-12', 1 ] ]
						}
					}
				}
			}
		};
		const statValue = getVideoStats( state, 2916285, 2454 );

		expect( statValue ).to.be.null;
	} );

	it( 'should return the video stats for a siteId, videoId', () => {
		const state = {
			stats: {
				videos: {
					items: {
						2916284: {
							2454: [ [ '2016-11-11', 1 ], [ '2016-11-12', 1 ] ]
						}
					}
				}
			}
		};
		const statValue = getVideoStats( state, 2916284, 2454 );

		expect( statValue ).to.eql( [ [ '2016-11-11', 1 ], [ '2016-11-12', 1 ] ] );
	} );
} );
