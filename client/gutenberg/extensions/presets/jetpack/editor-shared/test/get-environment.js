/** @format */

/**
 * Internal dependencies
 */
import getEnvironment from '../get-environment';

describe( 'getEnvironment()', () => {
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

	test( 'should return calypso by default', () => {
		window.location.pathname = '/';
		expect( getEnvironment() ).toBe( 'calypso' );
	} );

	test( 'should return calypso when starting a post in calypso', () => {
		window.location.pathname = '/gutenberg/post/yourjetpack.blog';
		expect( getEnvironment() ).toBe( 'calypso' );
	} );

	test( 'should return calypso when editing a post in calypso', () => {
		window.location.pathname = '/gutenberg/post/yourjetpack.blog/123';
		expect( getEnvironment() ).toBe( 'calypso' );
	} );

	test( 'should return wporg when starting a new post in wp-admin', () => {
		window.location.pathname = '/wp-admin/post.php';
		expect( getEnvironment() ).toBe( 'wporg' );
	} );

	test( 'should return wporg when editing post in wp-admin', () => {
		window.location.pathname = '/wp-admin/post-new.php';
		expect( getEnvironment() ).toBe( 'wporg' );
	} );

	test( 'should return wpcom when _currentSiteId is exposed', () => {
		window.location.pathname = '/gutenberg/post/yourjetpack.blog/123';
		window._currentSiteId = 12345678;
		expect( getEnvironment() ).toBe( 'wpcom' );
	} );
} );
