import { isRelativeUrl } from '../url';

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
