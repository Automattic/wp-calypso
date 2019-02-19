/**
 * Internal dependencies
 */
import getSiteFragment from '../get-site-fragment';

describe( 'getSiteFragment()', () => {
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
		expect( getSiteFragment() ).toBeNull();
	} );

	test( 'should return null when editing a post in wp-admin', () => {
		window.location.pathname = '/wp-admin/post.php';
		expect( getSiteFragment() ).toBeNull();
	} );

	test( 'should return null when starting a new post in wp-admin', () => {
		window.location.pathname = '/wp-admin/post-new.php';
		expect( getSiteFragment() ).toBeNull();
	} );

	test( 'should return site fragment when starting a post in calypso', () => {
		window.location.pathname = '/block-editor/post/yourjetpack.blog';
		expect( getSiteFragment() ).toBe( 'yourjetpack.blog' );
	} );

	test( 'should return site fragment when editing a post in calypso', () => {
		window.location.pathname = '/block-editor/post/yourjetpack.blog/123';
		expect( getSiteFragment() ).toBe( 'yourjetpack.blog' );
	} );

	test( 'should return site ID when _currentSiteId is exposed', () => {
		window.location.pathname = '/block-editor/post/yourjetpack.blog/123';
		window._currentSiteId = 12345678;
		expect( getSiteFragment() ).toBe( 12345678 );
	} );

	test( 'should return site slug when editing a post in Gutenberg in WP-Admin', () => {
		delete window._currentSiteId;
		window.Jetpack_Editor_Initial_State = {
			siteFragment: 'yourjetpack.blog',
		};
		expect( getSiteFragment() ).toBe( 'yourjetpack.blog' );
	} );
} );
