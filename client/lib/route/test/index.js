/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'route', function() {
	let route;

	useFakeDom();

	before( function() {
		route = require( '../' );
	} );

	describe( '#addQueryArgs()', () => {
		it( 'should error when args is not an object', () => {
			var types = [
				undefined,
				1,
				true,
				[],
				'test',
				function() {}
			];

			types.forEach( type => {
				expect( () => {
					route.addQueryArgs( type );
				} ).to.throw( Error );
			} );
		} );

		it( 'should error when url is not a string', () => {
			var types = [
				{},
				undefined,
				1,
				true,
				[],
				function() {}
			];

			types.forEach( type => {
				expect( () => {
					route.addQueryArgs( {}, type );
				} ).to.throw( Error );
			} );
		} );

		it( 'should return same URL with ending slash if passed empty object for args', () => {
			const url = route.addQueryArgs( {}, 'https://wordpress.com' );
			expect( url ).to.eql( 'https://wordpress.com/' );
		} );

		it( 'should add query args when URL has no args', () => {
			const url = route.addQueryArgs( { foo: 'bar' }, 'https://wordpress.com' );
			expect( url ).to.eql( 'https://wordpress.com/?foo=bar' );
		} );

		it( 'should persist existing query args and add new args', () => {
			const url = route.addQueryArgs( { foo: 'bar' }, 'https://wordpress.com?search=test' );
			expect( url ).to.eql( 'https://wordpress.com/?search=test&foo=bar' );
		} );

		it( 'should add an empty string for a query arg with an empty string', () => {
			const url = route.addQueryArgs( { foo: 'bar', baz: '' }, 'https://wordpress.com?search=test' );
			expect( url ).to.eql( 'https://wordpress.com/?search=test&foo=bar&baz=' );
		} );

		it( 'should not include a query arg with a null value', () => {
			const url = route.addQueryArgs( { foo: 'bar', baz: null }, 'https://wordpress.com?search=test' );
			expect( url ).to.eql( 'https://wordpress.com/?search=test&foo=bar' );
		} );

		it( 'should not include a query arg with an undefined value', () => {
			const url = route.addQueryArgs( { foo: 'bar', baz: undefined }, 'https://wordpress.com?search=test' );
			expect( url ).to.eql( 'https://wordpress.com/?search=test&foo=bar' );
		} );
	} );

	describe( 'getSiteFragment', function() {
		describe( 'for the root path', function() {
			it( 'should return false', function() {
				expect(
					route.getSiteFragment( '/' )
				).to.equal( false );
			} );
		} );
		describe( 'for editor paths', function() {
			it( 'should return false when there is no site yet', function() {
				expect(
					route.getSiteFragment( '/post' )
				).to.equal( false );
				expect(
					route.getSiteFragment( '/page' )
				).to.equal( false );
			} );
			it( 'should return the site when editing an existing post', function() {
				expect(
					route.getSiteFragment( '/post/example.wordpress.com/231' )
				).to.equal( 'example.wordpress.com' );
				expect(
					route.getSiteFragment( '/post/2916284/231' )
				).to.equal( 2916284 );
			} );
			it( 'should return the site when editing a new post', function() {
				expect(
					route.getSiteFragment( '/post/example.wordpress.com' )
				).to.equal( 'example.wordpress.com' );
				expect(
					route.getSiteFragment( '/post/2916284' )
				).to.equal( 2916284 );
				expect(
					route.getSiteFragment( '/post/example.wordpress.com/new' )
				).to.equal( 'example.wordpress.com' );
				expect(
					route.getSiteFragment( '/post/2916284/new' )
				).to.equal( 2916284 );
			} );
			it( 'should return the site when editing an existing page', function() {
				expect(
					route.getSiteFragment( '/page/example.wordpress.com/29' )
				).to.equal( 'example.wordpress.com' );
				expect(
					route.getSiteFragment( '/page/2916284/29' )
				).to.equal( 2916284 );
			} );
			it( 'should return the site when editing a new page', function() {
				expect(
					route.getSiteFragment( '/page/example.wordpress.com' )
				).to.equal( 'example.wordpress.com' );
				expect(
					route.getSiteFragment( '/page/2916284' )
				).to.equal( 2916284 );
				expect(
					route.getSiteFragment( '/page/example.wordpress.com/new' )
				).to.equal( 'example.wordpress.com' );
				expect(
					route.getSiteFragment( '/page/2916284/new' )
				).to.equal( 2916284 );
			} );
			it( 'should return the site when editing a an existing custom post type', function() {
				expect(
					route.getSiteFragment( '/edit/jetpack-portfolio/example.wordpress.com/218' )
				).to.equal( 'example.wordpress.com' );
				expect(
					route.getSiteFragment( '/edit/jetpack-portfolio/2916284/218' )
				).to.equal( 2916284 );
			} );
			it( 'should return the site when editing a new custom post type', function() {
				expect(
					route.getSiteFragment( '/edit/jetpack-portfolio/example.wordpress.com' )
				).to.equal( 'example.wordpress.com' );
				expect(
					route.getSiteFragment( '/edit/jetpack-portfolio/2916284' )
				).to.equal( 2916284 );
				expect(
					route.getSiteFragment( '/edit/jetpack-portfolio/example.wordpress.com/new' )
				).to.equal( 'example.wordpress.com' );
				expect(
					route.getSiteFragment( '/edit/jetpack-portfolio/2916284/new' )
				).to.equal( 2916284 );
			} );
			it( 'should not return a non-safe numeric site', () => {
				expect(
					route.getSiteFragment( '/edit/jetpack-portfolio/1000000000000000000000/new' )
				).to.be.false;
			} );
		} );
		describe( 'for listing paths', function() {
			it( 'should return false when there is no site yet', function() {
				expect(
					route.getSiteFragment( '/posts' )
				).to.equal( false );
				expect(
					route.getSiteFragment( '/posts/drafts' )
				).to.equal( false );
				expect(
					route.getSiteFragment( '/pages' )
				).to.equal( false );
				expect(
					route.getSiteFragment( '/pages/drafts' )
				).to.equal( false );
			} );
			it( 'should return the site when viewing posts', function() {
				expect(
					route.getSiteFragment( '/posts/example.wordpress.com' )
				).to.equal( 'example.wordpress.com' );
				expect(
					route.getSiteFragment( '/posts/2916284' )
				).to.equal( 2916284 );
			} );
			it( 'should return the site when viewing posts with a filter', function() {
				expect(
					route.getSiteFragment( '/posts/drafts/example.wordpress.com' )
				).to.equal( 'example.wordpress.com' );
				expect(
					route.getSiteFragment( '/posts/drafts/2916284' )
				).to.equal( 2916284 );
			} );
			it( 'should return the site when viewing pages', function() {
				expect(
					route.getSiteFragment( '/pages/example.wordpress.com' )
				).to.equal( 'example.wordpress.com' );
				expect(
					route.getSiteFragment( '/pages/2916284' )
				).to.equal( 2916284 );
			} );
			it( 'should return the site when viewing pages with a filter', function() {
				expect(
					route.getSiteFragment( '/pages/drafts/example.wordpress.com' )
				).to.equal( 'example.wordpress.com' );
				expect(
					route.getSiteFragment( '/pages/drafts/2916284' )
				).to.equal( 2916284 );
			} );
			it( 'should not return a non-safe numeric site', () => {
				expect(
					route.getSiteFragment( '/pages/drafts/1000000000000000000000' )
				).to.be.false;
			} );
		} );
		describe( 'for stats paths', function() {
			it( 'should return false when there is no site yet', function() {
				expect(
					route.getSiteFragment( '/stats' )
				).to.equal( false );
				expect(
					route.getSiteFragment( '/stats/day' )
				).to.equal( false );
			} );
			it( 'should return the site when viewing the default stats page', function() {
				expect(
					route.getSiteFragment( '/stats/day/example.wordpress.com' )
				).to.equal( 'example.wordpress.com' );
				expect(
					route.getSiteFragment( '/stats/day/2916284' )
				).to.equal( 2916284 );
			} );
			it( 'should not return a non-safe numeric site', () => {
				expect(
					route.getSiteFragment( '/stats/day/1000000000000000000000' )
				).to.be.false;
			} );
		} );
	} );

	describe( 'addSiteFragment', function() {
		describe( 'for editor paths', function() {
			it( 'should add a site when editing a new post', function() {
				expect(
					route.addSiteFragment( '/post', 'example.wordpress.com' )
				).to.equal( '/post/example.wordpress.com' );
				expect(
					route.addSiteFragment( '/post', 2916284 )
				).to.equal( '/post/2916284' );
				expect(
					route.addSiteFragment( '/post/new', 'example.wordpress.com' )
				).to.equal( '/post/example.wordpress.com/new' );
				expect(
					route.addSiteFragment( '/post/new', 2916284 )
				).to.equal( '/post/2916284/new' );
			} );
			it( 'should add a site when editing a new page', function() {
				expect(
					route.addSiteFragment( '/page', 'example.wordpress.com' )
				).to.equal( '/page/example.wordpress.com' );
				expect(
					route.addSiteFragment( '/page', 2916284 )
				).to.equal( '/page/2916284' );
				expect(
					route.addSiteFragment( '/page/new', 'example.wordpress.com' )
				).to.equal( '/page/example.wordpress.com/new' );
				expect(
					route.addSiteFragment( '/page/new', 2916284 )
				).to.equal( '/page/2916284/new' );
			} );
			it( 'should add a site when editing a new custom post type', function() {
				expect(
					route.addSiteFragment( '/edit/jetpack-portfolio', 'example.wordpress.com' )
				).to.equal( '/edit/jetpack-portfolio/example.wordpress.com' );
				expect(
					route.addSiteFragment( '/edit/jetpack-portfolio', 2916284 )
				).to.equal( '/edit/jetpack-portfolio/2916284' );
				expect(
					route.addSiteFragment( '/edit/jetpack-portfolio/new', 'example.wordpress.com' )
				).to.equal( '/edit/jetpack-portfolio/example.wordpress.com/new' );
				expect(
					route.addSiteFragment( '/edit/jetpack-portfolio/new', 2916284 )
				).to.equal( '/edit/jetpack-portfolio/2916284/new' );
			} );
			it( 'should replace the site when editing a new post', function() {
				expect(
					route.addSiteFragment( '/post/notexample.wordpress.com', 'example.wordpress.com' )
				).to.equal( '/post/example.wordpress.com' );
				expect(
					route.addSiteFragment( '/post/106782956', 2916284 )
				).to.equal( '/post/2916284' );
				expect(
					route.addSiteFragment( '/post/notexample.wordpress.com/new', 'example.wordpress.com' )
				).to.equal( '/post/example.wordpress.com/new' );
				expect(
					route.addSiteFragment( '/post/106782956/new', 2916284 )
				).to.equal( '/post/2916284/new' );
			} );
			it( 'should replace the site when editing a new page', function() {
				expect(
					route.addSiteFragment( '/page/notexample.wordpress.com', 'example.wordpress.com' )
				).to.equal( '/page/example.wordpress.com' );
				expect(
					route.addSiteFragment( '/page/106782956', 2916284 )
				).to.equal( '/page/2916284' );
				expect(
					route.addSiteFragment( '/page/notexample.wordpress.com/new', 'example.wordpress.com' )
				).to.equal( '/page/example.wordpress.com/new' );
				expect(
					route.addSiteFragment( '/page/106782956/new', 2916284 )
				).to.equal( '/page/2916284/new' );
			} );
			it( 'should replace the site when editing a new custom post type', function() {
				expect(
					route.addSiteFragment( '/edit/jetpack-portfolio/notexample.wordpress.com', 'example.wordpress.com' )
				).to.equal( '/edit/jetpack-portfolio/example.wordpress.com' );
				expect(
					route.addSiteFragment( '/edit/jetpack-portfolio/106782956', 2916284 )
				).to.equal( '/edit/jetpack-portfolio/2916284' );
				expect(
					route.addSiteFragment( '/edit/jetpack-portfolio/notexample.wordpress.com/new', 'example.wordpress.com' )
				).to.equal( '/edit/jetpack-portfolio/example.wordpress.com/new' );
				expect(
					route.addSiteFragment( '/edit/jetpack-portfolio/106782956/new', 2916284 )
				).to.equal( '/edit/jetpack-portfolio/2916284/new' );
			} );
			// These two tests are a bit contrived, but still good to have
			it( 'should replace the site when editing an existing post', function() {
				expect(
					route.addSiteFragment( '/post/notexample.wordpress.com/231', 'example.wordpress.com' )
				).to.equal( '/post/example.wordpress.com/231' );
				expect(
					route.addSiteFragment( '/post/106782956/231', 2916284 )
				).to.equal( '/post/2916284/231' );
			} );
			it( 'should replace the site when editing an existing page', function() {
				expect(
					route.addSiteFragment( '/page/notexample.wordpress.com/29', 'example.wordpress.com' )
				).to.equal( '/page/example.wordpress.com/29' );
				expect(
					route.addSiteFragment( '/page/106782956/29', 2916284 )
				).to.equal( '/page/2916284/29' );
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
				expect(
					route.addSiteFragment( '/posts', 2916284 )
				).to.equal( '/posts/2916284' );
			} );
			it( 'should append the site when viewing posts with a filter', function() {
				expect(
					route.addSiteFragment( '/posts/drafts', 'example.wordpress.com' )
				).to.equal( '/posts/drafts/example.wordpress.com' );
				expect(
					route.addSiteFragment( '/posts/drafts', 2916284 )
				).to.equal( '/posts/drafts/2916284' );
			} );
			it( 'should append the site when viewing pages', function() {
				expect(
					route.addSiteFragment( '/pages', 'example.wordpress.com' )
				).to.equal( '/pages/example.wordpress.com' );
				expect(
					route.addSiteFragment( '/pages', 2916284 )
				).to.equal( '/pages/2916284' );
			} );
			it( 'should append the site when viewing pages with a filter', function() {
				expect(
					route.addSiteFragment( '/pages/drafts', 'example.wordpress.com' )
				).to.equal( '/pages/drafts/example.wordpress.com' );
				expect(
					route.addSiteFragment( '/pages/drafts', 2916284 )
				).to.equal( '/pages/drafts/2916284' );
			} );
		} );
		describe( 'for stats paths', function() {
			it( 'should append the site when viewing stats without a filter', function() {
				expect(
					route.addSiteFragment( '/stats', 'example.wordpress.com' )
				).to.equal( '/stats/example.wordpress.com' );
				expect(
					route.addSiteFragment( '/stats', 2916284 )
				).to.equal( '/stats/2916284' );
			} );
			it( 'should append the site when viewing the default stats page', function() {
				expect(
					route.addSiteFragment( '/stats/day', 'example.wordpress.com' )
				).to.equal( '/stats/day/example.wordpress.com' );
				expect(
					route.addSiteFragment( '/stats/day', 2916284 )
				).to.equal( '/stats/day/2916284' );
			} );
		} );
	} );

	describe( 'sectionify', function() {
		describe( 'for the root path', function() {
			it( 'should return the same path', function() {
				expect(
					route.sectionify( '/' )
				).to.equal( '/' );
			} );
		} );
		describe( 'for editor paths', function() {
			it( 'should return the same path when there is no site yet', function() {
				expect(
					route.sectionify( '/post' )
				).to.equal( '/post' );
				expect(
					route.sectionify( '/page' )
				).to.equal( '/page' );
			} );
			it( 'should remove the site when editing an existing post', function() {
				expect(
					route.sectionify( '/post/example.wordpress.com/231' )
				).to.equal( '/post/231' );
				expect(
					route.sectionify( '/post/2916284/231' )
				).to.equal( '/post/231' );
			} );
			it( 'should remove the site when editing a new post', function() {
				expect(
					route.sectionify( '/post/example.wordpress.com' )
				).to.equal( '/post' );
				expect(
					route.sectionify( '/post/2916284' )
				).to.equal( '/post' );
				expect(
					route.sectionify( '/post/example.wordpress.com/new' )
				).to.equal( '/post/new' );
				expect(
					route.sectionify( '/post/2916284/new' )
				).to.equal( '/post/new' );
			} );
			it( 'should remove the site when editing an existing page', function() {
				expect(
					route.sectionify( '/page/example.wordpress.com/29' )
				).to.equal( '/page/29' );
				expect(
					route.sectionify( '/page/2916284/29' )
				).to.equal( '/page/29' );
			} );
			it( 'should remove the site when editing a new page', function() {
				expect(
					route.sectionify( '/page/example.wordpress.com' )
				).to.equal( '/page' );
				expect(
					route.sectionify( '/page/2916284' )
				).to.equal( '/page' );
				expect(
					route.sectionify( '/page/example.wordpress.com/new' )
				).to.equal( '/page/new' );
				expect(
					route.sectionify( '/page/2916284/new' )
				).to.equal( '/page/new' );
			} );
			it( 'should remove the site when editing an existing custom post type', function() {
				expect(
					route.sectionify( '/edit/jetpack-portfolio/example.wordpress.com/231' )
				).to.equal( '/edit/jetpack-portfolio/231' );
				expect(
					route.sectionify( '/edit/jetpack-portfolio/2916284/231' )
				).to.equal( '/edit/jetpack-portfolio/231' );
			} );
			it( 'should remove the site when editing a new custom post type', function() {
				expect(
					route.sectionify( '/edit/jetpack-portfolio/example.wordpress.com' )
				).to.equal( '/edit/jetpack-portfolio' );
				expect(
					route.sectionify( '/edit/jetpack-portfolio/2916284' )
				).to.equal( '/edit/jetpack-portfolio' );
				expect(
					route.sectionify( '/edit/jetpack-portfolio/example.wordpress.com/new' )
				).to.equal( '/edit/jetpack-portfolio/new' );
				expect(
					route.sectionify( '/edit/jetpack-portfolio/2916284/new' )
				).to.equal( '/edit/jetpack-portfolio/new' );
			} );
		} );
		describe( 'for listing paths', function() {
			it( 'should return the same path when there is no site yet', function() {
				expect(
					route.sectionify( '/posts' )
				).to.equal( '/posts' );
				expect(
					route.sectionify( '/posts/drafts' )
				).to.equal( '/posts/drafts' );
				expect(
					route.sectionify( '/pages' )
				).to.equal( '/pages' );
				expect(
					route.sectionify( '/pages/drafts' )
				).to.equal( '/pages/drafts' );
			} );
			it( 'should remove the site when viewing posts', function() {
				expect(
					route.sectionify( '/posts/example.wordpress.com' )
				).to.equal( '/posts' );
				expect(
					route.sectionify( '/posts/2916284' )
				).to.equal( '/posts' );
			} );
			it( 'should remove the site when viewing posts with a filter', function() {
				expect(
					route.sectionify( '/posts/drafts/example.wordpress.com' )
				).to.equal( '/posts/drafts' );
				expect(
					route.sectionify( '/posts/drafts/2916284' )
				).to.equal( '/posts/drafts' );
			} );
			it( 'should remove the site when viewing pages', function() {
				expect(
					route.sectionify( '/pages/example.wordpress.com' )
				).to.equal( '/pages' );
				expect(
					route.sectionify( '/pages/2916284' )
				).to.equal( '/pages' );
			} );
			it( 'should remove the site when viewing pages with a filter', function() {
				expect(
					route.sectionify( '/pages/drafts/example.wordpress.com' )
				).to.equal( '/pages/drafts' );
				expect(
					route.sectionify( '/pages/drafts/2916284' )
				).to.equal( '/pages/drafts' );
			} );
		} );
		describe( 'for stats paths', function() {
			it( 'should return the same path when there is no site yet', function() {
				expect(
					route.sectionify( '/stats' )
				).to.equal( '/stats' );
				expect(
					route.sectionify( '/stats/day' )
				).to.equal( '/stats/day' );
			} );
			it( 'should remove the site when viewing the default stats page', function() {
				expect(
					route.sectionify( '/stats/day/example.wordpress.com' )
				).to.equal( '/stats/day' );
				expect(
					route.sectionify( '/stats/day/2916284' )
				).to.equal( '/stats/day' );
			} );
		} );
	} );
} );
