require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
var expect = require( 'chai' ).expect;

/**
 * Internal dependencies
 */
var route = require( '../index' );

describe( 'lib/route', function() {

	describe( 'getSiteFragment', function() {
		describe( 'for the root path', function() {
			it( 'should return false', function() {
				expect( route.getSiteFragment( '/' ) ).to.equal( false );
			} );
		} );
		describe( 'for editor paths', function() {
			it( 'should return false when there is no site yet', function() {
				expect( route.getSiteFragment( '/post' ) ).to.equal( false );
				expect( route.getSiteFragment( '/page' ) ).to.equal( false );
			} );
			it( 'should return the site when editing an existing post', function() {
				expect( route.getSiteFragment( '/post/example.wordpress.com/231' ) ).to.equal( 'example.wordpress.com' );
			} );
			it( 'should return the site when editing a new post', function() {
				expect( route.getSiteFragment( '/post/example.wordpress.com' ) ).to.equal( 'example.wordpress.com' );
			} );
			it( 'should return the site when editing an existing page', function() {
				expect( route.getSiteFragment( '/page/example.wordpress.com/29' ) ).to.equal( 'example.wordpress.com' );
			} );
			it( 'should return the site when editing a new page', function() {
				expect( route.getSiteFragment( '/page/example.wordpress.com' ) ).to.equal( 'example.wordpress.com' );
			} );
		} );
		describe( 'for old-style editor paths', function() {
			it( 'should return the site when editing an existing post', function() {
				expect( route.getSiteFragment( '/post/231/example.wordpress.com' ) ).to.equal( 'example.wordpress.com' );
			} );
			it( 'should return the site when editing an existing page', function() {
				expect( route.getSiteFragment( '/page/29/example.wordpress.com' ) ).to.equal( 'example.wordpress.com' );
			} );
		} );
		describe( 'for listing paths', function() {
			it( 'should return false when there is no site yet', function() {
				expect( route.getSiteFragment( '/posts' ) ).to.equal( false );
				expect( route.getSiteFragment( '/posts/drafts' ) ).to.equal( false );
				expect( route.getSiteFragment( '/pages' ) ).to.equal( false );
				expect( route.getSiteFragment( '/pages/drafts' ) ).to.equal( false );
			} );
			it( 'should return the site when viewing posts', function() {
				expect( route.getSiteFragment( '/posts/example.wordpress.com' ) ).to.equal( 'example.wordpress.com' );
			} );
			it( 'should return the site when viewing posts with a filter', function() {
				expect( route.getSiteFragment( '/posts/drafts/example.wordpress.com' ) ).to.equal( 'example.wordpress.com' );
			} );
			it( 'should return the site when viewing pages', function() {
				expect( route.getSiteFragment( '/pages/example.wordpress.com' ) ).to.equal( 'example.wordpress.com' );
			} );
			it( 'should return the site when viewing pages with a filter', function() {
				expect( route.getSiteFragment( '/pages/drafts/example.wordpress.com' ) ).to.equal( 'example.wordpress.com' );
			} );
		} );
		describe( 'for stats paths', function() {
			it( 'should return false when there is no site yet', function() {
				expect( route.getSiteFragment( '/stats' ) ).to.equal( false );
				expect( route.getSiteFragment( '/stats/day' ) ).to.equal( false );
			} );
			it( 'should return the site when viewing the default stats page', function() {
				expect( route.getSiteFragment( '/stats/day/example.wordpress.com' ) ).to.equal( 'example.wordpress.com' );
			} );
		} );
	} );

	describe( 'addSiteFragment', function() {
		describe( 'for editor paths', function() {
			it( 'should add a site when editing a new post', function() {
				expect(
					route.addSiteFragment( '/post', 'example.wordpress.com' )
				).to.equal( '/post/example.wordpress.com' );
			} );
			it( 'should add a site when editing a new page', function() {
				expect(
					route.addSiteFragment( '/page', 'example.wordpress.com' )
				).to.equal( '/page/example.wordpress.com' );
			} );
			it( 'should replace the site when editing a new post', function() {
				expect(
					route.addSiteFragment( '/post/notexample.wordpress.com', 'example.wordpress.com' )
				).to.equal( '/post/example.wordpress.com' );
			} );
			it( 'should replace the site when editing a new page', function() {
				expect(
					route.addSiteFragment( '/page/notexample.wordpress.com', 'example.wordpress.com' )
				).to.equal( '/page/example.wordpress.com' );
			} );
			// These two tests are a bit contrived, but still good to have
			it( 'should replace the site when editing an existing post', function() {
				expect(
					route.addSiteFragment( '/post/notexample.wordpress.com/231', 'example.wordpress.com' )
				).to.equal( '/post/example.wordpress.com/231' );
			} );
			it( 'should replace the site when editing an existing page', function() {
				expect(
					route.addSiteFragment( '/page/notexample.wordpress.com/29', 'example.wordpress.com' )
				).to.equal( '/page/example.wordpress.com/29' );
			} );
			// Can't test adding a site here (going from /page/29 to
			// /page/:site/29 for example) because getSiteFragment would think
			// 29 was a numeric site ID.  This is fine because this is not
			// something we'll ever need to do.
		} );
		describe( 'for listing paths', function() {
			it( 'should append the site when viewing posts', function() {
				expect(
					route.addSiteFragment( '/posts', 'example.wordpress.com' )
				).to.equal( '/posts/example.wordpress.com' );
			} );
			it( 'should append the site when viewing posts with a filter', function() {
				expect(
					route.addSiteFragment( '/posts/drafts', 'example.wordpress.com' )
				).to.equal( '/posts/drafts/example.wordpress.com' );
			} );
			it( 'should append the site when viewing pages', function() {
				expect(
					route.addSiteFragment( '/pages', 'example.wordpress.com' )
				).to.equal( '/pages/example.wordpress.com' );
			} );
			it( 'should append the site when viewing pages with a filter', function() {
				expect(
					route.addSiteFragment( '/pages/drafts', 'example.wordpress.com' )
				).to.equal( '/pages/drafts/example.wordpress.com' );
			} );
		} );
		describe( 'for stats paths', function() {
			it( 'should append the site when viewing stats without a filter', function() {
				expect(
					route.addSiteFragment( '/stats', 'example.wordpress.com' )
				).to.equal( '/stats/example.wordpress.com' );
			} );
			it( 'should append the site when viewing the default stats page', function() {
				expect(
					route.addSiteFragment( '/stats/day', 'example.wordpress.com' )
				).to.equal( '/stats/day/example.wordpress.com' );
			} );
		} );
	} );

	describe( 'sectionify', function() {
		describe( 'for the root path', function() {
			it( 'should return the same path', function() {
				expect( route.sectionify( '/' ) ).to.equal( '/' );
			} );
		} );
		describe( 'for editor paths', function() {
			it( 'should return the same path when there is no site yet', function() {
				expect( route.sectionify( '/post' ) ).to.equal( '/post' );
				expect( route.sectionify( '/page' ) ).to.equal( '/page' );
			} );
			it( 'should remove the site when editing an existing post', function() {
				expect( route.sectionify( '/post/example.wordpress.com/231' ) ).to.equal( '/post/231' );
			} );
			it( 'should remove the site when editing a new post', function() {
				expect( route.sectionify( '/post/example.wordpress.com' ) ).to.equal( '/post' );
			} );
			it( 'should remove the site when editing an existing page', function() {
				expect( route.sectionify( '/page/example.wordpress.com/29' ) ).to.equal( '/page/29' );
			} );
			it( 'should remove the site when editing a new page', function() {
				expect( route.sectionify( '/page/example.wordpress.com' ) ).to.equal( '/page' );
			} );
		} );
		describe( 'for old-style editor paths', function() {
			it( 'should remove the site when editing an existing post', function() {
				expect( route.sectionify( '/post/231/example.wordpress.com' ) ).to.equal( '/post/231' );
			} );
			it( 'should remove the site when editing an existing page', function() {
				expect( route.sectionify( '/page/29/example.wordpress.com' ) ).to.equal( '/page/29' );
			} );
		} );
		describe( 'for listing paths', function() {
			it( 'should return the same path when there is no site yet', function() {
				expect( route.sectionify( '/posts' ) ).to.equal( '/posts' );
				expect( route.sectionify( '/posts/drafts' ) ).to.equal( '/posts/drafts' );
				expect( route.sectionify( '/pages' ) ).to.equal( '/pages' );
				expect( route.sectionify( '/pages/drafts' ) ).to.equal( '/pages/drafts' );
			} );
			it( 'should remove the site when viewing posts', function() {
				expect( route.sectionify( '/posts/example.wordpress.com' ) ).to.equal( '/posts' );
			} );
			it( 'should remove the site when viewing posts with a filter', function() {
				expect( route.sectionify( '/posts/drafts/example.wordpress.com' ) ).to.equal( '/posts/drafts' );
			} );
			it( 'should remove the site when viewing pages', function() {
				expect( route.sectionify( '/pages/example.wordpress.com' ) ).to.equal( '/pages' );
			} );
			it( 'should remove the site when viewing pages with a filter', function() {
				expect( route.sectionify( '/pages/drafts/example.wordpress.com' ) ).to.equal( '/pages/drafts' );
			} );
		} );
		describe( 'for stats paths', function() {
			it( 'should return the same path when there is no site yet', function() {
				expect( route.sectionify( '/stats' ) ).to.equal( '/stats' );
				expect( route.sectionify( '/stats/day' ) ).to.equal( '/stats/day' );
			} );
			it( 'should remove the site when viewing the default stats page', function() {
				expect( route.sectionify( '/stats/day/example.wordpress.com' ) ).to.equal( '/stats/day' );
			} );
		} );
	} );

} );
