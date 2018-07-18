/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { getiOSDeepLink } from 'blocks/app-banner';
import { EDITOR, NOTES, READER, STATS } from 'blocks/app-banner/utils';

describe( 'iOS deep links', () => {
	test( 'returns correct URIs for each route', () => {
		[ STATS, READER, EDITOR, NOTES ].forEach( section =>
			expect( getiOSDeepLink( '/test', section ) ).toMatchSnapshot()
		);
	} );

	test( 'returns a valid Reader URI for the root path', () => {
		expect( getiOSDeepLink( '/', READER ).split( '#' )[ 1 ] ).toBe( '%2Fread' );
	} );

	test( 'passes through a non-root Reader URI as the fragment', () => {
		expect( getiOSDeepLink( '/read/feeds/12345/posts/6789', READER ).split( '#' )[ 1 ] ).toBe(
			'%2Fread%2Ffeeds%2F12345%2Fposts%2F6789'
		);
	} );

	test( 'passes through a Stats URI as the fragment', () => {
		expect( getiOSDeepLink( '/stats/day/discover.wordpress.com', STATS ).split( '#' )[ 1 ] ).toBe(
			'%2Fstats%2Fday%2Fdiscover.wordpress.com'
		);
	} );

	test( 'adds link info in fragment', () => {
		expect( getiOSDeepLink( 'test', STATS ).includes( '#' ) ).toBeTruthy();
	} );

	test( 'returns correct URIs for other sections', () => {
		expect( getiOSDeepLink( 'test', 'example' ).includes( '#' ) ).toBeFalsy();
	} );

	test( 'properly encodes tricky fragments', () => {
		expect( getiOSDeepLink( '?://&#', STATS ).split( '#' )[ 1 ] ).toEqual( '%3F%3A%2F%2F%26%23' );
	} );

	test( 'returns a URI even if the path is null', () => {
		[ STATS, READER, EDITOR, NOTES ].forEach( section =>
			expect( getiOSDeepLink( null, section ) ).toMatchSnapshot()
		);
	} );
} );
