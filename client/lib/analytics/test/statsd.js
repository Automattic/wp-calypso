/** @format */

/**
 * External dependencies
 */
import url from 'url';

/**
 * Internal dependencies
 */
import { statsdTimingUrl } from '../statsd';

describe( 'StatsD Analytics', () => {
	describe( 'statsdTimingUrl', () => {
		test( 'returns a URL for recording timing data to statsd', () => {
			const sdUrl = url.parse( statsdTimingUrl( 'post-mysite.com', 'page-load', 150 ), true, true );
			expect( sdUrl.query.v ).toEqual( 'calypso' );
			expect( sdUrl.query.u ).toEqual( 'post_mysite_com' );
			expect( sdUrl.query.json ).toEqual(
				JSON.stringify( {
					beacons: [ 'calypso.development.post_mysite_com.page_load:150|ms' ],
				} )
			);
		} );
	} );
} );
