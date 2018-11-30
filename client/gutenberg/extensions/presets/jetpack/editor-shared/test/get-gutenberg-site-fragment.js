/** @format */

/**
 * Internal dependencies
 */
import getGutenbergSiteFragment from '../get-gutenberg-site-fragment';

describe( 'getGutenbergSiteFragment()', () => {
	let beforeWindow;

	beforeAll( () => {
		beforeWindow = global.window;
		global.window = {
			location: {},
		};
	} );

	afterAll( () => {
		global.window = beforeWindow;
	} );

	test( 'should return null by default', () => {
		window.location.pathname = '/';
		expect( getGutenbergSiteFragment() ).toBeNull();
	} );

	test( 'should return null when editing a post in wp-admin', () => {
		window.location.pathname = '/wp-admin/post.php';
		expect( getGutenbergSiteFragment() ).toBeNull();
	} );

	test( 'should return null when starting a new post in wp-admin', () => {
		window.location.pathname = '/wp-admin/post-new.php';
		expect( getGutenbergSiteFragment() ).toBeNull();
	} );

	test( 'should return site fragment when starting a post in calypso', () => {
		window.location.pathname = '/gutenberg/post/yourjetpack.blog';
		expect( getGutenbergSiteFragment() ).toBe( 'yourjetpack.blog' );
	} );

	test( 'should return site fragment when editing a post in calypso', () => {
		window.location.pathname = '/gutenberg/post/yourjetpack.blog/123';
		expect( getGutenbergSiteFragment() ).toBe( 'yourjetpack.blog' );
	} );

	test( 'should return site ID when _currentSiteId is exposed', () => {
		window.location.pathname = '/gutenberg/post/yourjetpack.blog/123';
		window._currentSiteId = 12345678;
		expect( getGutenbergSiteFragment() ).toBe( 12345678 );
	} );
} );
