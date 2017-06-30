/**
 * External dependencies
 */
import { expect } from 'chai';
import url from 'url';

/**
 * Internal dependencies
 */
import { statsdUrl } from '../statsd';

describe( 'StatsD Analytics', function() {
	describe( 'statsdUrl', function() {
		it( 'returns a URL for recording timing data to statsd', function() {
			const sdUrl = url.parse(
				statsdUrl( '/post/mysite.com', 'page-load', 150 ),
				true,
				true
			);
			expect( sdUrl.query.v ).to.eql( 'calypso' );
			expect( sdUrl.query.u ).to.eql( '/post/mysite.com' );
			expect( sdUrl.query.json ).to.eql( JSON.stringify( {
				beacons: [
					'calypso.development.post_mysite_com.page_load:150|ms'
				]
			} ) );
		} );
	} );
} );
