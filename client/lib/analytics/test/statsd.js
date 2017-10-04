/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import url from 'url';

/**
 * Internal dependencies
 */
import { statsdTimingUrl } from '../statsd';

describe( 'StatsD Analytics', function() {
	describe( 'statsdTimingUrl', function() {
		it( 'returns a URL for recording timing data to statsd', function() {
			const sdUrl = url.parse( statsdTimingUrl( 'post-mysite.com', 'page-load', 150 ), true, true );
			expect( sdUrl.query.v ).to.eql( 'calypso' );
			expect( sdUrl.query.u ).to.eql( 'post_mysite_com' );
			expect( sdUrl.query.json ).to.eql(
				JSON.stringify( {
					beacons: [ 'calypso.development.post_mysite_com.page_load:150|ms' ],
				} )
			);
		} );
	} );
} );
