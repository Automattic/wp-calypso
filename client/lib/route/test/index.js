/**
 * @jest-environment jsdom
 */

import * as route from '../';

describe( 'route', function () {
	describe( 'getSiteFragment', function () {
		describe( 'for the root path', function () {
			test( 'should return false', function () {
				expect( route.getSiteFragment( '/' ) ).toEqual( false );
			} );
		} );
		describe( 'for editor paths', function () {
			test( 'should return false when there is no site yet', function () {
				expect( route.getSiteFragment( '/post' ) ).toEqual( false );
				expect( route.getSiteFragment( '/page' ) ).toEqual( false );
			} );
			test( 'should return the site when editing an existing post', function () {
				expect( route.getSiteFragment( '/post/example.wordpress.com/231' ) ).toEqual(
					'example.wordpress.com'
				);
				expect( route.getSiteFragment( '/post/2916284/231' ) ).toEqual( 2916284 );
			} );
			test( 'should return the site when editing a new post', function () {
				expect( route.getSiteFragment( '/post/example.wordpress.com' ) ).toEqual(
					'example.wordpress.com'
				);
				expect( route.getSiteFragment( '/post/2916284' ) ).toEqual( 2916284 );
				expect( route.getSiteFragment( '/post/example.wordpress.com/new' ) ).toEqual(
					'example.wordpress.com'
				);
				expect( route.getSiteFragment( '/post/2916284/new' ) ).toEqual( 2916284 );
			} );
			test( 'should return the site when editing an existing page', function () {
				expect( route.getSiteFragment( '/page/example.wordpress.com/29' ) ).toEqual(
					'example.wordpress.com'
				);
				expect( route.getSiteFragment( '/page/2916284/29' ) ).toEqual( 2916284 );
			} );
			test( 'should return the site when editing a new page', function () {
				expect( route.getSiteFragment( '/page/example.wordpress.com' ) ).toEqual(
					'example.wordpress.com'
				);
				expect( route.getSiteFragment( '/page/2916284' ) ).toEqual( 2916284 );
				expect( route.getSiteFragment( '/page/example.wordpress.com/new' ) ).toEqual(
					'example.wordpress.com'
				);
				expect( route.getSiteFragment( '/page/2916284/new' ) ).toEqual( 2916284 );
			} );
			test( 'should return the site when editing a an existing custom post type', function () {
				expect(
					route.getSiteFragment( '/edit/jetpack-portfolio/example.wordpress.com/218' )
				).toEqual( 'example.wordpress.com' );
				expect( route.getSiteFragment( '/edit/jetpack-portfolio/2916284/218' ) ).toEqual( 2916284 );
			} );
			test( 'should return the site when editing a new custom post type', function () {
				expect( route.getSiteFragment( '/edit/jetpack-portfolio/example.wordpress.com' ) ).toEqual(
					'example.wordpress.com'
				);
				expect( route.getSiteFragment( '/edit/jetpack-portfolio/2916284' ) ).toEqual( 2916284 );
				expect(
					route.getSiteFragment( '/edit/jetpack-portfolio/example.wordpress.com/new' )
				).toEqual( 'example.wordpress.com' );
				expect( route.getSiteFragment( '/edit/jetpack-portfolio/2916284/new' ) ).toEqual( 2916284 );
			} );
			test( 'should not return a non-safe numeric site', () => {
				expect(
					route.getSiteFragment( '/edit/jetpack-portfolio/1000000000000000000000/new' )
				).toBe( false );
			} );
		} );
		describe( 'for listing paths', function () {
			test( 'should return false when there is no site yet', function () {
				expect( route.getSiteFragment( '/posts' ) ).toEqual( false );
				expect( route.getSiteFragment( '/posts/drafts' ) ).toEqual( false );
				expect( route.getSiteFragment( '/pages' ) ).toEqual( false );
				expect( route.getSiteFragment( '/pages/drafts' ) ).toEqual( false );
			} );
			test( 'should return the site when viewing posts', function () {
				expect( route.getSiteFragment( '/posts/example.wordpress.com' ) ).toEqual(
					'example.wordpress.com'
				);
				expect( route.getSiteFragment( '/posts/2916284' ) ).toEqual( 2916284 );
			} );
			test( 'should return the site when viewing posts with a filter', function () {
				expect( route.getSiteFragment( '/posts/drafts/example.wordpress.com' ) ).toEqual(
					'example.wordpress.com'
				);
				expect( route.getSiteFragment( '/posts/drafts/2916284' ) ).toEqual( 2916284 );
			} );
			test( 'should return the site when viewing pages', function () {
				expect( route.getSiteFragment( '/pages/example.wordpress.com' ) ).toEqual(
					'example.wordpress.com'
				);
				expect( route.getSiteFragment( '/pages/2916284' ) ).toEqual( 2916284 );
			} );
			test( 'should return the site when viewing pages with a filter', function () {
				expect( route.getSiteFragment( '/pages/drafts/example.wordpress.com' ) ).toEqual(
					'example.wordpress.com'
				);
				expect( route.getSiteFragment( '/pages/drafts/2916284' ) ).toEqual( 2916284 );
			} );
			test( 'should not return a non-safe numeric site', () => {
				expect( route.getSiteFragment( '/pages/drafts/1000000000000000000000' ) ).toBe( false );
			} );
		} );
		describe( 'for stats paths', function () {
			test( 'should return false when there is no site yet', function () {
				expect( route.getSiteFragment( '/stats' ) ).toEqual( false );
				expect( route.getSiteFragment( '/stats/day' ) ).toEqual( false );
			} );
			test( 'should return the site when viewing the default stats page', function () {
				expect( route.getSiteFragment( '/stats/day/example.wordpress.com' ) ).toEqual(
					'example.wordpress.com'
				);
				expect( route.getSiteFragment( '/stats/day/2916284' ) ).toEqual( 2916284 );
			} );
			test( 'should not return a non-safe numeric site', () => {
				expect( route.getSiteFragment( '/stats/day/1000000000000000000000' ) ).toBe( false );
			} );
		} );
		describe( 'for purchases paths', function () {
			test( 'should return the correct site fragment when working with purchases', function () {
				expect( route.getSiteFragment( '/me/purchases/example.wordpress.com' ) ).toEqual(
					'example.wordpress.com'
				);
				expect( route.getSiteFragment( '/me/purchases/2916284' ) ).toEqual( 2916284 );
				expect( route.getSiteFragment( '/me/purchases/example.wordpress.com/cancel' ) ).toEqual(
					'example.wordpress.com'
				);
				expect( route.getSiteFragment( '/me/purchases/2916284/cancel' ) ).toEqual( 2916284 );
				expect(
					route.getSiteFragment(
						'/me/purchases/example.wordpress.com/12345678/payment/edit/87654321'
					)
				).toEqual( 'example.wordpress.com' );
				expect(
					route.getSiteFragment( '/me/purchases/2916284/12345678/payment/edit/87654321' )
				).toEqual( 2916284 );
			} );
		} );
		describe( 'for checkout paths', function () {
			test( 'should return false for gift checkouts', function () {
				expect(
					route.getSiteFragment( '/checkout/value_bundle/gift/18726247?cancel_to=/home' )
				).toEqual( false );
			} );
			test( 'should return false for domain checkouts', function () {
				expect( route.getSiteFragment( '/checkout/thank-you/no-site/75806534' ) ).toEqual( false );
			} );
			test( 'should return the correct site fragment on the checkout thank you page', function () {
				expect(
					route.getSiteFragment( '/checkout/thank-you/example.wordpress.com/75806534' )
				).toEqual( 'example.wordpress.com' );
			} );
			test( 'should return the correct site fragment during upsell', function () {
				expect(
					route.getSiteFragment(
						'/checkout/offer-professional-email/new-domain.com/75806534/example.wordpress.com'
					)
				).toEqual( 'example.wordpress.com' );
			} );
			test( 'should return the correct site fragment on domain renewals', function () {
				expect(
					route.getSiteFragment(
						'/checkout/dotin_domain:example.in/renew/17254842/example.wordpress.com'
					)
				).toEqual( 'example.wordpress.com' );
			} );
			test( 'should return the correct site fragment when it is found outside the 3rd position', function () {
				expect(
					route.getSiteFragment(
						'/checkout/thank-you/features/all-free-features/example.wordpress.com/12345678'
					)
				).toEqual( 'example.wordpress.com' );
			} );
		} );
		describe( 'for jetpack paths', function () {
			test( 'should return correct site fragment when site_url is trailing slashed', function () {
				expect( route.getSiteFragment( '/jetpack/connect/plans/subdomain.example.com::' ) ).toEqual(
					'subdomain.example.com'
				);
			} );
		} );
		describe( 'for plugins paths', function () {
			test( 'should return correct site fragment', function () {
				expect( route.getSiteFragment( '/plugins/404-to-301/example.wpcomstaging.com' ) ).toEqual(
					'example.wpcomstaging.com'
				);
			} );
			test( 'should return false when plugin name ends a number', function () {
				expect( route.getSiteFragment( '/plugins/404-to-301' ) ).toEqual( false );
			} );
		} );
	} );

	describe( 'addSiteFragment', function () {
		describe( 'for editor paths', function () {
			test( 'should add a site when editing a new post', function () {
				expect( route.addSiteFragment( '/post', 'example.wordpress.com' ) ).toEqual(
					'/post/example.wordpress.com'
				);
				expect( route.addSiteFragment( '/post', 2916284 ) ).toEqual( '/post/2916284' );
				expect( route.addSiteFragment( '/post/new', 'example.wordpress.com' ) ).toEqual(
					'/post/example.wordpress.com/new'
				);
				expect( route.addSiteFragment( '/post/new', 2916284 ) ).toEqual( '/post/2916284/new' );
			} );
			test( 'should add a site when editing a new page', function () {
				expect( route.addSiteFragment( '/page', 'example.wordpress.com' ) ).toEqual(
					'/page/example.wordpress.com'
				);
				expect( route.addSiteFragment( '/page', 2916284 ) ).toEqual( '/page/2916284' );
				expect( route.addSiteFragment( '/page/new', 'example.wordpress.com' ) ).toEqual(
					'/page/example.wordpress.com/new'
				);
				expect( route.addSiteFragment( '/page/new', 2916284 ) ).toEqual( '/page/2916284/new' );
			} );
			test( 'should add a site when editing a new custom post type', function () {
				expect(
					route.addSiteFragment( '/edit/jetpack-portfolio', 'example.wordpress.com' )
				).toEqual( '/edit/jetpack-portfolio/example.wordpress.com' );
				expect( route.addSiteFragment( '/edit/jetpack-portfolio', 2916284 ) ).toEqual(
					'/edit/jetpack-portfolio/2916284'
				);
				expect(
					route.addSiteFragment( '/edit/jetpack-portfolio/new', 'example.wordpress.com' )
				).toEqual( '/edit/jetpack-portfolio/example.wordpress.com/new' );
				expect( route.addSiteFragment( '/edit/jetpack-portfolio/new', 2916284 ) ).toEqual(
					'/edit/jetpack-portfolio/2916284/new'
				);
			} );
			test( 'should replace the site when editing a new post', function () {
				expect(
					route.addSiteFragment( '/post/notexample.wordpress.com', 'example.wordpress.com' )
				).toEqual( '/post/example.wordpress.com' );
				expect( route.addSiteFragment( '/post/106782956', 2916284 ) ).toEqual( '/post/2916284' );
				expect(
					route.addSiteFragment( '/post/notexample.wordpress.com/new', 'example.wordpress.com' )
				).toEqual( '/post/example.wordpress.com/new' );
				expect( route.addSiteFragment( '/post/106782956/new', 2916284 ) ).toEqual(
					'/post/2916284/new'
				);
			} );
			test( 'should replace the site when editing a new page', function () {
				expect(
					route.addSiteFragment( '/page/notexample.wordpress.com', 'example.wordpress.com' )
				).toEqual( '/page/example.wordpress.com' );
				expect( route.addSiteFragment( '/page/106782956', 2916284 ) ).toEqual( '/page/2916284' );
				expect(
					route.addSiteFragment( '/page/notexample.wordpress.com/new', 'example.wordpress.com' )
				).toEqual( '/page/example.wordpress.com/new' );
				expect( route.addSiteFragment( '/page/106782956/new', 2916284 ) ).toEqual(
					'/page/2916284/new'
				);
			} );
			test( 'should replace the site when editing a new custom post type', function () {
				expect(
					route.addSiteFragment(
						'/edit/jetpack-portfolio/notexample.wordpress.com',
						'example.wordpress.com'
					)
				).toEqual( '/edit/jetpack-portfolio/example.wordpress.com' );
				expect( route.addSiteFragment( '/edit/jetpack-portfolio/106782956', 2916284 ) ).toEqual(
					'/edit/jetpack-portfolio/2916284'
				);
				expect(
					route.addSiteFragment(
						'/edit/jetpack-portfolio/notexample.wordpress.com/new',
						'example.wordpress.com'
					)
				).toEqual( '/edit/jetpack-portfolio/example.wordpress.com/new' );
				expect( route.addSiteFragment( '/edit/jetpack-portfolio/106782956/new', 2916284 ) ).toEqual(
					'/edit/jetpack-portfolio/2916284/new'
				);
			} );
			// These two tests are a bit contrived, but still good to have
			test( 'should replace the site when editing an existing post', function () {
				expect(
					route.addSiteFragment( '/post/notexample.wordpress.com/231', 'example.wordpress.com' )
				).toEqual( '/post/example.wordpress.com/231' );
				expect( route.addSiteFragment( '/post/106782956/231', 2916284 ) ).toEqual(
					'/post/2916284/231'
				);
			} );
			test( 'should replace the site when editing an existing page', function () {
				expect(
					route.addSiteFragment( '/page/notexample.wordpress.com/29', 'example.wordpress.com' )
				).toEqual( '/page/example.wordpress.com/29' );
				expect( route.addSiteFragment( '/page/106782956/29', 2916284 ) ).toEqual(
					'/page/2916284/29'
				);
			} );
			// Can't test adding a site here (going from /page/29 to
			// /page/:site/29 for example) because getSiteFragment would think
			// 29 was a numeric site ID.  This is fine because this is not
			// something we'll ever need to do.
		} );
		describe( 'for listing paths', function () {
			test( 'should append the site when viewing posts', function () {
				expect( route.addSiteFragment( '/posts', 'example.wordpress.com' ) ).toEqual(
					'/posts/example.wordpress.com'
				);
				expect( route.addSiteFragment( '/posts', 2916284 ) ).toEqual( '/posts/2916284' );
			} );
			test( 'should append the site when viewing posts with a filter', function () {
				expect( route.addSiteFragment( '/posts/drafts', 'example.wordpress.com' ) ).toEqual(
					'/posts/drafts/example.wordpress.com'
				);
				expect( route.addSiteFragment( '/posts/drafts', 2916284 ) ).toEqual(
					'/posts/drafts/2916284'
				);
			} );
			test( 'should append the site when viewing pages', function () {
				expect( route.addSiteFragment( '/pages', 'example.wordpress.com' ) ).toEqual(
					'/pages/example.wordpress.com'
				);
				expect( route.addSiteFragment( '/pages', 2916284 ) ).toEqual( '/pages/2916284' );
			} );
			test( 'should append the site when viewing pages with a filter', function () {
				expect( route.addSiteFragment( '/pages/drafts', 'example.wordpress.com' ) ).toEqual(
					'/pages/drafts/example.wordpress.com'
				);
				expect( route.addSiteFragment( '/pages/drafts', 2916284 ) ).toEqual(
					'/pages/drafts/2916284'
				);
			} );
		} );
		describe( 'for stats paths', function () {
			test( 'should append the site when viewing stats without a filter', function () {
				expect( route.addSiteFragment( '/stats', 'example.wordpress.com' ) ).toEqual(
					'/stats/example.wordpress.com'
				);
				expect( route.addSiteFragment( '/stats', 2916284 ) ).toEqual( '/stats/2916284' );
			} );
			test( 'should append the site when viewing the default stats page', function () {
				expect( route.addSiteFragment( '/stats/day', 'example.wordpress.com' ) ).toEqual(
					'/stats/day/example.wordpress.com'
				);
				expect( route.addSiteFragment( '/stats/day', 2916284 ) ).toEqual( '/stats/day/2916284' );
			} );
		} );
	} );

	describe( 'sectionify', function () {
		describe( 'for the root path', function () {
			test( 'should return the same path', function () {
				expect( route.sectionify( '/' ) ).toEqual( '/' );
			} );
		} );
		describe( 'for editor paths', function () {
			test( 'should return the same path when there is no site yet', function () {
				expect( route.sectionify( '/post' ) ).toEqual( '/post' );
				expect( route.sectionify( '/page' ) ).toEqual( '/page' );
			} );
			test( 'should remove the site when editing an existing post', function () {
				expect( route.sectionify( '/post/example.wordpress.com/231' ) ).toEqual( '/post/231' );
				expect( route.sectionify( '/post/2916284/231' ) ).toEqual( '/post/231' );
			} );
			test( 'should remove the site when editing a new post', function () {
				expect( route.sectionify( '/post/example.wordpress.com' ) ).toEqual( '/post' );
				expect( route.sectionify( '/post/2916284' ) ).toEqual( '/post' );
				expect( route.sectionify( '/post/example.wordpress.com/new' ) ).toEqual( '/post/new' );
				expect( route.sectionify( '/post/2916284/new' ) ).toEqual( '/post/new' );
			} );
			test( 'should remove the site when editing an existing page', function () {
				expect( route.sectionify( '/page/example.wordpress.com/29' ) ).toEqual( '/page/29' );
				expect( route.sectionify( '/page/2916284/29' ) ).toEqual( '/page/29' );
			} );
			test( 'should remove the site when editing a new page', function () {
				expect( route.sectionify( '/page/example.wordpress.com' ) ).toEqual( '/page' );
				expect( route.sectionify( '/page/2916284' ) ).toEqual( '/page' );
				expect( route.sectionify( '/page/example.wordpress.com/new' ) ).toEqual( '/page/new' );
				expect( route.sectionify( '/page/2916284/new' ) ).toEqual( '/page/new' );
			} );
			test( 'should remove the site when editing an existing custom post type', function () {
				expect( route.sectionify( '/edit/jetpack-portfolio/example.wordpress.com/231' ) ).toEqual(
					'/edit/jetpack-portfolio/231'
				);
				expect( route.sectionify( '/edit/jetpack-portfolio/2916284/231' ) ).toEqual(
					'/edit/jetpack-portfolio/231'
				);
			} );
			test( 'should remove the site when editing a new custom post type', function () {
				expect( route.sectionify( '/edit/jetpack-portfolio/example.wordpress.com' ) ).toEqual(
					'/edit/jetpack-portfolio'
				);
				expect( route.sectionify( '/edit/jetpack-portfolio/2916284' ) ).toEqual(
					'/edit/jetpack-portfolio'
				);
				expect( route.sectionify( '/edit/jetpack-portfolio/example.wordpress.com/new' ) ).toEqual(
					'/edit/jetpack-portfolio/new'
				);
				expect( route.sectionify( '/edit/jetpack-portfolio/2916284/new' ) ).toEqual(
					'/edit/jetpack-portfolio/new'
				);
			} );
		} );
		describe( 'for listing paths', function () {
			test( 'should return the same path when there is no site yet', function () {
				expect( route.sectionify( '/posts' ) ).toEqual( '/posts' );
				expect( route.sectionify( '/posts/drafts' ) ).toEqual( '/posts/drafts' );
				expect( route.sectionify( '/pages' ) ).toEqual( '/pages' );
				expect( route.sectionify( '/pages/drafts' ) ).toEqual( '/pages/drafts' );
			} );
			test( 'should remove the site when viewing posts', function () {
				expect( route.sectionify( '/posts/example.wordpress.com' ) ).toEqual( '/posts' );
				expect( route.sectionify( '/posts/2916284' ) ).toEqual( '/posts' );
			} );
			test( 'should remove the site when viewing posts with a filter', function () {
				expect( route.sectionify( '/posts/drafts/example.wordpress.com' ) ).toEqual(
					'/posts/drafts'
				);
				expect( route.sectionify( '/posts/drafts/2916284' ) ).toEqual( '/posts/drafts' );
			} );
			test( 'should remove the site when viewing pages', function () {
				expect( route.sectionify( '/pages/example.wordpress.com' ) ).toEqual( '/pages' );
				expect( route.sectionify( '/pages/2916284' ) ).toEqual( '/pages' );
			} );
			test( 'should remove the site when viewing pages with a filter', function () {
				expect( route.sectionify( '/pages/drafts/example.wordpress.com' ) ).toEqual(
					'/pages/drafts'
				);
				expect( route.sectionify( '/pages/drafts/2916284' ) ).toEqual( '/pages/drafts' );
			} );
		} );
		describe( 'for stats paths', function () {
			test( 'should return the same path when there is no site yet', function () {
				expect( route.sectionify( '/stats' ) ).toEqual( '/stats' );
				expect( route.sectionify( '/stats/day' ) ).toEqual( '/stats/day' );
			} );
			test( 'should remove the site when viewing the default stats page', function () {
				expect( route.sectionify( '/stats/day/example.wordpress.com' ) ).toEqual( '/stats/day' );
				expect( route.sectionify( '/stats/day/2916284' ) ).toEqual( '/stats/day' );
			} );
		} );
		describe( 'for special paths', function () {
			test( 'should remove the site when the fragment is passed explicitly', function () {
				expect( route.sectionify( '/domains/manage/not-a-site', 'not-a-site' ) ).toEqual(
					'/domains/manage'
				);
			} );
		} );
	} );

	describe( 'getMessagePathForJITM', function () {
		test( 'strips starting and ending slash from path', function () {
			expect( route.getMessagePathForJITM( '/test/' ) ).toEqual( 'test' );
		} );

		test( 'converts internal slashes to dashes', function () {
			expect( route.getMessagePathForJITM( 'test/path/to/site' ) ).toEqual( 'test-path-to-site' );
		} );

		test( 'should simplify stats paths', function () {
			expect( route.getMessagePathForJITM( '/stats/day' ) ).toEqual( 'stats' );
			expect( route.getMessagePathForJITM( '/stats/week' ) ).toEqual( 'stats' );
			expect( route.getMessagePathForJITM( '/stats/month' ) ).toEqual( 'stats' );
			expect( route.getMessagePathForJITM( '/stats/year' ) ).toEqual( 'stats' );
			expect( route.getMessagePathForJITM( '/stats/insights' ) ).toEqual( 'stats' );
		} );
	} );
} );
