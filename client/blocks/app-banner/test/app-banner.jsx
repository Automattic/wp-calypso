/**
 * @format
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { getiOSDeepLink, buildDeepLinkFragment } from 'blocks/app-banner';
import { EDITOR, NOTES, READER, STATS } from 'blocks/app-banner/utils';

describe( 'iOS deep link fragments', () => {
	test( 'properly encodes tricky fragments', () => {
		expect( buildDeepLinkFragment( '?://&#', STATS ) ).toEqual( '%3F%3A%2F%2F%26%23' );
	} );

	test( 'returns a fragment for a null path', () => {
		expect( buildDeepLinkFragment( null, STATS ).length ).toBeTruthy();
	} );

	test( 'returns a fragment for each section', () => {
		[ STATS, READER, EDITOR, NOTES ].forEach( section =>
			expect( buildDeepLinkFragment( '/test', section ) ).toMatchSnapshot()
		);
	} );

	test( 'returns an empty fragment for other sections', () => {
		expect( buildDeepLinkFragment( 'test', 'example' ).length ).toBeFalsy();
	} );

	test( 'returns a valid Reader URI for the root path', () => {
		expect( buildDeepLinkFragment( '/', READER ) ).toBe( '%2Fread' );
	} );

	test( 'passes through a non-root Reader path', () => {
		expect( buildDeepLinkFragment( '/read/feeds/12345/posts/6789', READER ) ).toBe(
			'%2Fread%2Ffeeds%2F12345%2Fposts%2F6789'
		);
	} );

	test( 'passes through a Stats path', () => {
		expect( buildDeepLinkFragment( '/stats/day/discover.wordpress.com', STATS ) ).toBe(
			'%2Fstats%2Fday%2Fdiscover.wordpress.com'
		);
	} );
} );

describe( 'iOS deep links', () => {
	test( 'returns a URI even if the path is null', () => {
		expect( getiOSDeepLink( null, STATS ) ).toBeTruthy();
	} );

	test( 'returns URIs for each path', () => {
		[ STATS, READER, EDITOR, NOTES ].forEach( section =>
			expect( getiOSDeepLink( '/test', section ) ).toMatchSnapshot()
		);
	} );

	test( 'includes fragment in URI', () => {
		expect( getiOSDeepLink( '/test', STATS ).includes( '#' ) ).toBeTruthy();
		expect( getiOSDeepLink( '/test', STATS ).split( '#' )[ 1 ].length ).toBeTruthy();
	} );
} );
