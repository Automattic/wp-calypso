import * as route from '../';

describe( 'index', () => {
	describe( 'getStreamUrlFromPost', () => {
		test( 'should return url for post from feed', () => {
			expect( route.getStreamUrlFromPost( { feed_ID: 1234 } ) ).toEqual( '/reader/feeds/1234' );
		} );

		test( 'should return url for post from site', () => {
			expect( route.getStreamUrlFromPost( { site_ID: 1234 } ) ).toEqual( '/reader/blogs/1234' );
		} );
	} );

	describe( 'getSiteUrl', () => {
		test( 'should return site URL', () => {
			expect( route.getSiteUrl( 1234 ) ).toEqual( '/reader/blogs/1234' );
		} );
	} );

	describe( 'getFeedUrl', () => {
		test( 'should return site URL', () => {
			expect( route.getFeedUrl( 1234 ) ).toEqual( '/reader/feeds/1234' );
		} );
	} );
} );
