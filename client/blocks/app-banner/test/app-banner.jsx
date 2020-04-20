/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { getiOSDeepLink, buildDeepLinkFragment } from 'blocks/app-banner';
import { EDITOR, NOTES, READER, STATS, getCurrentSection } from 'blocks/app-banner/utils';

describe( 'iOS deep link fragments', () => {
	test( 'properly encodes tricky fragments', () => {
		const funnyFragment = '?://&#';
		expect( buildDeepLinkFragment( funnyFragment, STATS ) ).toEqual(
			encodeURIComponent( funnyFragment )
		);
	} );

	test( 'returns a fragment for a null path', () => {
		expect( buildDeepLinkFragment( null, STATS ).length ).toBeTruthy();
	} );

	test( 'returns a fragment for each section', () => {
		[ STATS, READER, EDITOR, NOTES ].forEach( ( section ) =>
			expect( buildDeepLinkFragment( '/test', section ) ).toMatchSnapshot()
		);
	} );

	test( 'returns an empty fragment for other sections', () => {
		expect( buildDeepLinkFragment( 'test', 'example' ).length ).toBeFalsy();
	} );

	test( 'returns a valid Reader URI for the root of the Reader section', () => {
		expect( buildDeepLinkFragment( '/read', READER ) ).toBe( '%2Fread' );
	} );

	test( 'passes through a non-root Reader path', () => {
		const path = '/read/feeds/12345/posts/6789';
		expect( buildDeepLinkFragment( path, READER ) ).toBe( encodeURIComponent( path ) );
	} );

	test( 'passes through a Stats path', () => {
		const path = '/stats/day/discover.wordpress.com';
		expect( buildDeepLinkFragment( path, STATS ) ).toBe( encodeURIComponent( path ) );
	} );
} );

describe( 'iOS deep links', () => {
	test( 'returns a URI even if the path is null', () => {
		expect( getiOSDeepLink( null, STATS ) ).toBeTruthy();
	} );

	test( 'returns URIs for each path', () => {
		[ STATS, READER, EDITOR, NOTES ].forEach( ( section ) =>
			expect( getiOSDeepLink( '/test', section ) ).toMatchSnapshot()
		);
	} );

	test( 'includes fragment in URI', () => {
		expect( getiOSDeepLink( '/test', STATS ).includes( '#' ) ).toBeTruthy();
		expect( getiOSDeepLink( '/test', STATS ).split( '#' )[ 1 ].length ).toBeTruthy();
	} );
} );

describe( 'getCurrentSection', () => {
	test( 'returns stats if in stats section', () => {
		expect( getCurrentSection( STATS, false, '/stats/123' ) ).toBe( STATS );
	} );

	test( 'returns null for activity log page', () => {
		expect( getCurrentSection( STATS, false, '/stats/activity/123' ) ).toBe( null );
	} );

	test( 'returns notes if notes is open', () => {
		expect( getCurrentSection( STATS, true, '/stats/123' ) ).toBe( NOTES );
	} );

	test( 'returns reader if in reader section', () => {
		expect( getCurrentSection( READER, false, '/' ) ).toBe( READER );
	} );

	test( 'returns editor if in editor section', () => {
		expect( getCurrentSection( EDITOR, false, '/post/123' ) ).toBe( EDITOR );
	} );

	test( 'returns null if in a disallowed section', () => {
		expect( getCurrentSection( 'plugins', false, '/plugins/123' ) ).toBe( null );
	} );
} );
