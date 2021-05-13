/**
 * External dependencies
 */
import url from 'url';

/**
 * Internal dependencies
 */
import { statsdTimingUrl, statsdCountingUrl } from '../statsd-utils';

describe( 'StatsD Analytics Utils', () => {
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

	describe( 'statsdCountingUrl', () => {
		test( 'returns a URL for recording counting data to statsd', () => {
			const sdUrl = url.parse(
				statsdCountingUrl( 'post-mysite.com', 'page-count', 1 ),
				true,
				true
			);
			expect( sdUrl.query.v ).toEqual( 'calypso' );
			expect( sdUrl.query.u ).toEqual( 'post_mysite_com' );
			expect( sdUrl.query.json ).toEqual(
				JSON.stringify( {
					beacons: [ 'calypso.development.post_mysite_com.page_count:1|c' ],
				} )
			);
		} );
	} );
} );
