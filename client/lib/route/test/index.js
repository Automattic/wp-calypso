/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { Route } from 'page';

/**
 * Internal dependencies
 */
import {
	addQueryArgs,
	addSiteFragment,
	getSiteFragment,
	sectionify,
	sectionifyWithRoutes,
} from '../index';

const checkoutRoutes = [
	new Route( '/checkout/thank-you' ),
	new Route( '/checkout/thank-you/:receipt' ),
	new Route( '/checkout/:product' ),
	new Route( '/checkout/:product/renew/:receipt' ),
];

const commentsRoutes = [
	new Route( '/comments/approved/:domain' ),
	new Route( '/comments/pending/:domain' ),
];

describe( 'route', function() {
	describe( '#addQueryArgs()', () => {
		test( 'should error when args is not an object', () => {
			const types = [ undefined, 1, true, [], 'test', function() {} ];

			types.forEach( type => {
				expect( () => {
					addQueryArgs( type );
				} ).to.throw( Error );
			} );
		} );

		test( 'should error when url is not a string', () => {
			const types = [ {}, undefined, 1, true, [], function() {} ];

			types.forEach( type => {
				expect( () => {
					addQueryArgs( {}, type );
				} ).to.throw( Error );
			} );
		} );

		test( 'should return same URL with ending slash if passed empty object for args', () => {
			const url = addQueryArgs( {}, 'https://wordpress.com' );
			expect( url ).to.eql( 'https://wordpress.com/' );
		} );

		test( 'should add query args when URL has no args', () => {
			const url = addQueryArgs( { foo: 'bar' }, 'https://wordpress.com' );
			expect( url ).to.eql( 'https://wordpress.com/?foo=bar' );
		} );

		test( 'should persist existing query args and add new args', () => {
			const url = addQueryArgs( { foo: 'bar' }, 'https://wordpress.com?search=test' );
			expect( url ).to.eql( 'https://wordpress.com/?search=test&foo=bar' );
		} );

		test( 'should add an empty string for a query arg with an empty string', () => {
			const url = addQueryArgs( { foo: 'bar', baz: '' }, 'https://wordpress.com?search=test' );
			expect( url ).to.eql( 'https://wordpress.com/?search=test&foo=bar&baz=' );
		} );

		test( 'should not include a query arg with a null value', () => {
			const url = addQueryArgs( { foo: 'bar', baz: null }, 'https://wordpress.com?search=test' );
			expect( url ).to.eql( 'https://wordpress.com/?search=test&foo=bar' );
		} );

		test( 'should not include a query arg with an undefined value', () => {
			const url = addQueryArgs(
				{ foo: 'bar', baz: undefined },
				'https://wordpress.com?search=test'
			);
			expect( url ).to.eql( 'https://wordpress.com/?search=test&foo=bar' );
		} );
	} );

	describe( 'getSiteFragment', function() {
		describe( 'for the root path', function() {
			test( 'should return false', function() {
				expect( getSiteFragment( '/' ) ).to.equal( false );
			} );
		} );
		describe( 'for editor paths', function() {
			test( 'should return false when there is no site yet', function() {
				expect( getSiteFragment( '/post' ) ).to.equal( false );
				expect( getSiteFragment( '/page' ) ).to.equal( false );
			} );
			test( 'should return the site when editing an existing post', function() {
				expect( getSiteFragment( '/post/example.wordpress.com/231' ) ).to.equal(
					'example.wordpress.com'
				);
				expect( getSiteFragment( '/post/2916284/231' ) ).to.equal( 2916284 );
			} );
			test( 'should return the site when editing a new post', function() {
				expect( getSiteFragment( '/post/example.wordpress.com' ) ).to.equal(
					'example.wordpress.com'
				);
				expect( getSiteFragment( '/post/2916284' ) ).to.equal( 2916284 );
				expect( getSiteFragment( '/post/example.wordpress.com/new' ) ).to.equal(
					'example.wordpress.com'
				);
				expect( getSiteFragment( '/post/2916284/new' ) ).to.equal( 2916284 );
			} );
			test( 'should return the site when editing an existing page', function() {
				expect( getSiteFragment( '/page/example.wordpress.com/29' ) ).to.equal(
					'example.wordpress.com'
				);
				expect( getSiteFragment( '/page/2916284/29' ) ).to.equal( 2916284 );
			} );
			test( 'should return the site when editing a new page', function() {
				expect( getSiteFragment( '/page/example.wordpress.com' ) ).to.equal(
					'example.wordpress.com'
				);
				expect( getSiteFragment( '/page/2916284' ) ).to.equal( 2916284 );
				expect( getSiteFragment( '/page/example.wordpress.com/new' ) ).to.equal(
					'example.wordpress.com'
				);
				expect( getSiteFragment( '/page/2916284/new' ) ).to.equal( 2916284 );
			} );
			test( 'should return the site when editing a an existing custom post type', function() {
				expect( getSiteFragment( '/edit/jetpack-portfolio/example.wordpress.com/218' ) ).to.equal(
					'example.wordpress.com'
				);
				expect( getSiteFragment( '/edit/jetpack-portfolio/2916284/218' ) ).to.equal( 2916284 );
			} );
			test( 'should return the site when editing a new custom post type', function() {
				expect( getSiteFragment( '/edit/jetpack-portfolio/example.wordpress.com' ) ).to.equal(
					'example.wordpress.com'
				);
				expect( getSiteFragment( '/edit/jetpack-portfolio/2916284' ) ).to.equal( 2916284 );
				expect( getSiteFragment( '/edit/jetpack-portfolio/example.wordpress.com/new' ) ).to.equal(
					'example.wordpress.com'
				);
				expect( getSiteFragment( '/edit/jetpack-portfolio/2916284/new' ) ).to.equal( 2916284 );
			} );
			test( 'should not return a non-safe numeric site', () => {
				expect( getSiteFragment( '/edit/jetpack-portfolio/1000000000000000000000/new' ) ).to.be
					.false;
			} );
		} );
		describe( 'for listing paths', function() {
			test( 'should return false when there is no site yet', function() {
				expect( getSiteFragment( '/posts' ) ).to.equal( false );
				expect( getSiteFragment( '/posts/drafts' ) ).to.equal( false );
				expect( getSiteFragment( '/pages' ) ).to.equal( false );
				expect( getSiteFragment( '/pages/drafts' ) ).to.equal( false );
			} );
			test( 'should return the site when viewing posts', function() {
				expect( getSiteFragment( '/posts/example.wordpress.com' ) ).to.equal(
					'example.wordpress.com'
				);
				expect( getSiteFragment( '/posts/2916284' ) ).to.equal( 2916284 );
			} );
			test( 'should return the site when viewing posts with a filter', function() {
				expect( getSiteFragment( '/posts/drafts/example.wordpress.com' ) ).to.equal(
					'example.wordpress.com'
				);
				expect( getSiteFragment( '/posts/drafts/2916284' ) ).to.equal( 2916284 );
			} );
			test( 'should return the site when viewing pages', function() {
				expect( getSiteFragment( '/pages/example.wordpress.com' ) ).to.equal(
					'example.wordpress.com'
				);
				expect( getSiteFragment( '/pages/2916284' ) ).to.equal( 2916284 );
			} );
			test( 'should return the site when viewing pages with a filter', function() {
				expect( getSiteFragment( '/pages/drafts/example.wordpress.com' ) ).to.equal(
					'example.wordpress.com'
				);
				expect( getSiteFragment( '/pages/drafts/2916284' ) ).to.equal( 2916284 );
			} );
			test( 'should not return a non-safe numeric site', () => {
				expect( getSiteFragment( '/pages/drafts/1000000000000000000000' ) ).to.be.false;
			} );
		} );
		describe( 'for stats paths', function() {
			test( 'should return false when there is no site yet', function() {
				expect( getSiteFragment( '/stats' ) ).to.equal( false );
				expect( getSiteFragment( '/stats/day' ) ).to.equal( false );
			} );
			test( 'should return the site when viewing the default stats page', function() {
				expect( getSiteFragment( '/stats/day/example.wordpress.com' ) ).to.equal(
					'example.wordpress.com'
				);
				expect( getSiteFragment( '/stats/day/2916284' ) ).to.equal( 2916284 );
			} );
			test( 'should not return a non-safe numeric site', () => {
				expect( getSiteFragment( '/stats/day/1000000000000000000000' ) ).to.be.false;
			} );
		} );
	} );

	describe( 'addSiteFragment', function() {
		describe( 'for editor paths', function() {
			test( 'should add a site when editing a new post', function() {
				expect( addSiteFragment( '/post', 'example.wordpress.com' ) ).to.equal(
					'/post/example.wordpress.com'
				);
				expect( addSiteFragment( '/post', 2916284 ) ).to.equal( '/post/2916284' );
				expect( addSiteFragment( '/post/new', 'example.wordpress.com' ) ).to.equal(
					'/post/example.wordpress.com/new'
				);
				expect( addSiteFragment( '/post/new', 2916284 ) ).to.equal( '/post/2916284/new' );
			} );
			test( 'should add a site when editing a new page', function() {
				expect( addSiteFragment( '/page', 'example.wordpress.com' ) ).to.equal(
					'/page/example.wordpress.com'
				);
				expect( addSiteFragment( '/page', 2916284 ) ).to.equal( '/page/2916284' );
				expect( addSiteFragment( '/page/new', 'example.wordpress.com' ) ).to.equal(
					'/page/example.wordpress.com/new'
				);
				expect( addSiteFragment( '/page/new', 2916284 ) ).to.equal( '/page/2916284/new' );
			} );
			test( 'should add a site when editing a new custom post type', function() {
				expect( addSiteFragment( '/edit/jetpack-portfolio', 'example.wordpress.com' ) ).to.equal(
					'/edit/jetpack-portfolio/example.wordpress.com'
				);
				expect( addSiteFragment( '/edit/jetpack-portfolio', 2916284 ) ).to.equal(
					'/edit/jetpack-portfolio/2916284'
				);
				expect(
					addSiteFragment( '/edit/jetpack-portfolio/new', 'example.wordpress.com' )
				).to.equal( '/edit/jetpack-portfolio/example.wordpress.com/new' );
				expect( addSiteFragment( '/edit/jetpack-portfolio/new', 2916284 ) ).to.equal(
					'/edit/jetpack-portfolio/2916284/new'
				);
			} );
			test( 'should replace the site when editing a new post', function() {
				expect(
					addSiteFragment( '/post/notexample.wordpress.com', 'example.wordpress.com' )
				).to.equal( '/post/example.wordpress.com' );
				expect( addSiteFragment( '/post/106782956', 2916284 ) ).to.equal( '/post/2916284' );
				expect(
					addSiteFragment( '/post/notexample.wordpress.com/new', 'example.wordpress.com' )
				).to.equal( '/post/example.wordpress.com/new' );
				expect( addSiteFragment( '/post/106782956/new', 2916284 ) ).to.equal( '/post/2916284/new' );
			} );
			test( 'should replace the site when editing a new page', function() {
				expect(
					addSiteFragment( '/page/notexample.wordpress.com', 'example.wordpress.com' )
				).to.equal( '/page/example.wordpress.com' );
				expect( addSiteFragment( '/page/106782956', 2916284 ) ).to.equal( '/page/2916284' );
				expect(
					addSiteFragment( '/page/notexample.wordpress.com/new', 'example.wordpress.com' )
				).to.equal( '/page/example.wordpress.com/new' );
				expect( addSiteFragment( '/page/106782956/new', 2916284 ) ).to.equal( '/page/2916284/new' );
			} );
			test( 'should replace the site when editing a new custom post type', function() {
				expect(
					addSiteFragment(
						'/edit/jetpack-portfolio/notexample.wordpress.com',
						'example.wordpress.com'
					)
				).to.equal( '/edit/jetpack-portfolio/example.wordpress.com' );
				expect( addSiteFragment( '/edit/jetpack-portfolio/106782956', 2916284 ) ).to.equal(
					'/edit/jetpack-portfolio/2916284'
				);
				expect(
					addSiteFragment(
						'/edit/jetpack-portfolio/notexample.wordpress.com/new',
						'example.wordpress.com'
					)
				).to.equal( '/edit/jetpack-portfolio/example.wordpress.com/new' );
				expect( addSiteFragment( '/edit/jetpack-portfolio/106782956/new', 2916284 ) ).to.equal(
					'/edit/jetpack-portfolio/2916284/new'
				);
			} );
			// These two tests are a bit contrived, but still good to have
			test( 'should replace the site when editing an existing post', function() {
				expect(
					addSiteFragment( '/post/notexample.wordpress.com/231', 'example.wordpress.com' )
				).to.equal( '/post/example.wordpress.com/231' );
				expect( addSiteFragment( '/post/106782956/231', 2916284 ) ).to.equal( '/post/2916284/231' );
			} );
			test( 'should replace the site when editing an existing page', function() {
				expect(
					addSiteFragment( '/page/notexample.wordpress.com/29', 'example.wordpress.com' )
				).to.equal( '/page/example.wordpress.com/29' );
				expect( addSiteFragment( '/page/106782956/29', 2916284 ) ).to.equal( '/page/2916284/29' );
			} );
			// Can't test adding a site here (going from /page/29 to
			// /page/:site/29 for example) because getSiteFragment would think
			// 29 was a numeric site ID.  This is fine because this is not
			// something we'll ever need to do.
		} );
		describe( 'for listing paths', function() {
			test( 'should append the site when viewing posts', function() {
				expect( addSiteFragment( '/posts', 'example.wordpress.com' ) ).to.equal(
					'/posts/example.wordpress.com'
				);
				expect( addSiteFragment( '/posts', 2916284 ) ).to.equal( '/posts/2916284' );
			} );
			test( 'should append the site when viewing posts with a filter', function() {
				expect( addSiteFragment( '/posts/drafts', 'example.wordpress.com' ) ).to.equal(
					'/posts/drafts/example.wordpress.com'
				);
				expect( addSiteFragment( '/posts/drafts', 2916284 ) ).to.equal( '/posts/drafts/2916284' );
			} );
			test( 'should append the site when viewing pages', function() {
				expect( addSiteFragment( '/pages', 'example.wordpress.com' ) ).to.equal(
					'/pages/example.wordpress.com'
				);
				expect( addSiteFragment( '/pages', 2916284 ) ).to.equal( '/pages/2916284' );
			} );
			test( 'should append the site when viewing pages with a filter', function() {
				expect( addSiteFragment( '/pages/drafts', 'example.wordpress.com' ) ).to.equal(
					'/pages/drafts/example.wordpress.com'
				);
				expect( addSiteFragment( '/pages/drafts', 2916284 ) ).to.equal( '/pages/drafts/2916284' );
			} );
		} );
		describe( 'for stats paths', function() {
			test( 'should append the site when viewing stats without a filter', function() {
				expect( addSiteFragment( '/stats', 'example.wordpress.com' ) ).to.equal(
					'/stats/example.wordpress.com'
				);
				expect( addSiteFragment( '/stats', 2916284 ) ).to.equal( '/stats/2916284' );
			} );
			test( 'should append the site when viewing the default stats page', function() {
				expect( addSiteFragment( '/stats/day', 'example.wordpress.com' ) ).to.equal(
					'/stats/day/example.wordpress.com'
				);
				expect( addSiteFragment( '/stats/day', 2916284 ) ).to.equal( '/stats/day/2916284' );
			} );
		} );
	} );

	describe( 'sectionify', function() {
		describe( 'for the root path', function() {
			test( 'should return the same path', function() {
				expect( sectionify( '/' ) ).to.equal( '/' );
			} );
		} );
		describe( 'for editor paths', function() {
			test( 'should return the same path when there is no site yet', function() {
				expect( sectionify( '/post' ) ).to.equal( '/post' );
				expect( sectionify( '/page' ) ).to.equal( '/page' );
			} );
			test( 'should remove the site when editing an existing post', function() {
				expect( sectionify( '/post/example.wordpress.com/231' ) ).to.equal( '/post/231' );
				expect( sectionify( '/post/2916284/231' ) ).to.equal( '/post/231' );
			} );
			test( 'should remove the site when editing a new post', function() {
				expect( sectionify( '/post/example.wordpress.com' ) ).to.equal( '/post' );
				expect( sectionify( '/post/2916284' ) ).to.equal( '/post' );
				expect( sectionify( '/post/example.wordpress.com/new' ) ).to.equal( '/post/new' );
				expect( sectionify( '/post/2916284/new' ) ).to.equal( '/post/new' );
			} );
			test( 'should remove the site when editing an existing page', function() {
				expect( sectionify( '/page/example.wordpress.com/29' ) ).to.equal( '/page/29' );
				expect( sectionify( '/page/2916284/29' ) ).to.equal( '/page/29' );
			} );
			test( 'should remove the site when editing a new page', function() {
				expect( sectionify( '/page/example.wordpress.com' ) ).to.equal( '/page' );
				expect( sectionify( '/page/2916284' ) ).to.equal( '/page' );
				expect( sectionify( '/page/example.wordpress.com/new' ) ).to.equal( '/page/new' );
				expect( sectionify( '/page/2916284/new' ) ).to.equal( '/page/new' );
			} );
			test( 'should remove the site when editing an existing custom post type', function() {
				expect( sectionify( '/edit/jetpack-portfolio/example.wordpress.com/231' ) ).to.equal(
					'/edit/jetpack-portfolio/231'
				);
				expect( sectionify( '/edit/jetpack-portfolio/2916284/231' ) ).to.equal(
					'/edit/jetpack-portfolio/231'
				);
			} );
			test( 'should remove the site when editing a new custom post type', function() {
				expect( sectionify( '/edit/jetpack-portfolio/example.wordpress.com' ) ).to.equal(
					'/edit/jetpack-portfolio'
				);
				expect( sectionify( '/edit/jetpack-portfolio/2916284' ) ).to.equal(
					'/edit/jetpack-portfolio'
				);
				expect( sectionify( '/edit/jetpack-portfolio/example.wordpress.com/new' ) ).to.equal(
					'/edit/jetpack-portfolio/new'
				);
				expect( sectionify( '/edit/jetpack-portfolio/2916284/new' ) ).to.equal(
					'/edit/jetpack-portfolio/new'
				);
			} );
		} );
		describe( 'for listing paths', function() {
			test( 'should return the same path when there is no site yet', function() {
				expect( sectionify( '/posts' ) ).to.equal( '/posts' );
				expect( sectionify( '/posts/drafts' ) ).to.equal( '/posts/drafts' );
				expect( sectionify( '/pages' ) ).to.equal( '/pages' );
				expect( sectionify( '/pages/drafts' ) ).to.equal( '/pages/drafts' );
			} );
			test( 'should remove the site when viewing posts', function() {
				expect( sectionify( '/posts/example.wordpress.com' ) ).to.equal( '/posts' );
				expect( sectionify( '/posts/2916284' ) ).to.equal( '/posts' );
			} );
			test( 'should remove the site when viewing posts with a filter', function() {
				expect( sectionify( '/posts/drafts/example.wordpress.com' ) ).to.equal( '/posts/drafts' );
				expect( sectionify( '/posts/drafts/2916284' ) ).to.equal( '/posts/drafts' );
			} );
			test( 'should remove the site when viewing pages', function() {
				expect( sectionify( '/pages/example.wordpress.com' ) ).to.equal( '/pages' );
				expect( sectionify( '/pages/2916284' ) ).to.equal( '/pages' );
			} );
			test( 'should remove the site when viewing pages with a filter', function() {
				expect( sectionify( '/pages/drafts/example.wordpress.com' ) ).to.equal( '/pages/drafts' );
				expect( sectionify( '/pages/drafts/2916284' ) ).to.equal( '/pages/drafts' );
			} );
		} );
		describe( 'for stats paths', function() {
			test( 'should return the same path when there is no site yet', function() {
				expect( sectionify( '/stats' ) ).to.equal( '/stats' );
				expect( sectionify( '/stats/day' ) ).to.equal( '/stats/day' );
			} );
			test( 'should remove the site when viewing the default stats page', function() {
				expect( sectionify( '/stats/day/example.wordpress.com' ) ).to.equal( '/stats/day' );
				expect( sectionify( '/stats/day/2916284' ) ).to.equal( '/stats/day' );
			} );
		} );
		describe( 'for special paths', function() {
			test( 'should remove the site when the fragment is passed explicitly', function() {
				expect( sectionify( '/domains/manage/not-a-site', 'not-a-site' ) ).to.equal(
					'/domains/manage'
				);
			} );
		} );
	} );
	describe( 'sectionifyWithRoutes', function() {
		describe( 'for checkout paths', function() {
			test( 'should parameterize checkout thank you paths', function() {
				expect( sectionifyWithRoutes( '/checkout/thank-you', checkoutRoutes ) ).to.deep.equal( {
					routePath: '/checkout/thank-you',
					routeParams: {},
				} );
				expect(
					sectionifyWithRoutes( '/checkout/thank-you/25222194', checkoutRoutes )
				).to.deep.equal( {
					routePath: '/checkout/thank-you/:receipt',
					routeParams: {
						receipt: '25222194',
					},
				} );
			} );
			test( 'should parameterize checkout paths', function() {
				expect( sectionifyWithRoutes( '/checkout/gapps', checkoutRoutes ) ).to.deep.equal( {
					routePath: '/checkout/:product',
					routeParams: {
						product: 'gapps',
					},
				} );
				expect( sectionifyWithRoutes( '/checkout/theme:elemin', checkoutRoutes ) ).to.deep.equal( {
					routePath: '/checkout/:product',
					routeParams: {
						product: 'theme:elemin',
					},
				} );
				expect(
					sectionifyWithRoutes( '/checkout/domain_map:69thclergycouncil.com', checkoutRoutes )
				).to.deep.equal( {
					routePath: '/checkout/:product',
					routeParams: {
						product: 'domain_map:69thclergycouncil.com',
					},
				} );
			} );
			test( 'should parameterize checkout renew paths', function() {
				expect(
					sectionifyWithRoutes( '/checkout/gapps/renew/6527469', checkoutRoutes )
				).to.deep.equal( {
					routePath: '/checkout/:product/renew/:receipt',
					routeParams: {
						product: 'gapps',
						receipt: '6527469',
					},
				} );
				expect(
					sectionifyWithRoutes( '/checkout/jetpack_premium_monthly/renew/7980613', checkoutRoutes )
				).to.deep.equal( {
					routePath: '/checkout/:product/renew/:receipt',
					routeParams: {
						product: 'jetpack_premium_monthly',
						receipt: '7980613',
					},
				} );
				expect(
					sectionifyWithRoutes( '/checkout/personal-bundle/renew/6611954', checkoutRoutes )
				).to.deep.equal( {
					routePath: '/checkout/:product/renew/:receipt',
					routeParams: {
						product: 'personal-bundle',
						receipt: '6611954',
					},
				} );
				expect(
					sectionifyWithRoutes(
						'/checkout/domain_map:69thclergycouncil.com/renew/5164008',
						checkoutRoutes
					)
				).to.deep.equal( {
					routePath: '/checkout/:product/renew/:receipt',
					routeParams: {
						product: 'domain_map:69thclergycouncil.com',
						receipt: '5164008',
					},
				} );
			} );
			test( 'should parameterize comment paths', function() {
				expect( sectionifyWithRoutes( '/comments/approved', commentsRoutes ) ).to.deep.equal( {
					routePath: '/comments/approved',
					routeParams: {},
				} );
				expect( sectionifyWithRoutes( '/comments/pending', commentsRoutes ) ).to.deep.equal( {
					routePath: '/comments/pending',
					routeParams: {},
				} );
				expect(
					sectionifyWithRoutes(
						'/comments/approved/elmundodelaliteraturasite.wordpress.com',
						commentsRoutes
					)
				).to.deep.equal( {
					routePath: '/comments/approved/:domain',
					routeParams: {
						domain: 'elmundodelaliteraturasite.wordpress.com',
					},
				} );
				expect(
					sectionifyWithRoutes(
						'/comments/pending/17evasetyowatimm2.wordpress.com',
						commentsRoutes
					)
				).to.deep.equal( {
					routePath: '/comments/pending/:domain',
					routeParams: {
						domain: '17evasetyowatimm2.wordpress.com',
					},
				} );
			} );
		} );
	} );
} );
