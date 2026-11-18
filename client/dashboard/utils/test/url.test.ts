import { getUrlOnOrigins, isRelativeUrl } from '../url';

describe( 'isRelativeUrl', () => {
	test.each( [
		'/',
		'/sites',
		'/sites/example.com?tab=plans#top',
		'sites/example.com',
		'?foo=bar',
	] )( 'should return true for %p', ( url ) => {
		expect( isRelativeUrl( url ) ).toBe( true );
	} );

	test.each( [
		'',
		'https://evil.com',
		'javascript:alert(1)',
		'//evil.com',
		'/\\evil.com',
		'\\\\evil.com',
		'\\/evil.com',
		' //evil.com',
		'\t//evil.com',
		'/\t/evil.com',
		'/\n/evil.com',
		'java\tscript:alert(1)',
		'//evil.com\u0000',
	] )( 'should return false for %p', ( url ) => {
		expect( isRelativeUrl( url ) ).toBe( false );
	} );
} );

describe( 'getUrlOnOrigins', () => {
	const origins = [ 'https://wordpress.com' ];
	const base = 'https://wordpress.com/checkout';

	test.each( [
		[ '/home', 'https://wordpress.com/home' ],
		[ 'path', 'https://wordpress.com/path' ],
		[ '../path', 'https://wordpress.com/path' ],
		[ 'https://wordpress.com/path', 'https://wordpress.com/path' ],
		[ '//wordpress.com/path', 'https://wordpress.com/path' ],
		[ '/\\wordpress.com/path', 'https://wordpress.com/path' ],
		// Kept whole: as a relative URL, `//evil.example` would be another host.
		[ '/.//evil.example', 'https://wordpress.com//evil.example' ],
	] )( 'should resolve %p on an allowed origin', ( url, expected ) => {
		expect( getUrlOnOrigins( url, origins, base ) ).toBe( expected );
	} );

	test.each( [
		'http://example.com',
		'//example.com',
		'/\\example.com',
		'https://wordpress.com.evil.example/path',
		'https://wordpress.com@evil.example/path',
		'javascript:alert(1)',
		'data:text/html,<script>alert(1)</script>',
		'mailto:test@example.com',
	] )( 'should reject %p', ( url ) => {
		expect( getUrlOnOrigins( url, origins, base ) ).toBeUndefined();
	} );
} );
