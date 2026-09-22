import { isAllowedRedirectUrl } from '../sign-in-with-apple';

describe( 'isAllowedRedirectUrl', () => {
	test.each( [
		'/',
		'/log-in/apple/callback',
		'/me/security/social-login',
		'/start/user?foo=bar',
		'https://my.wordpress.com',
		'https://my.wordpress.com/v2/me/security',
	] )( 'allows %s', ( url ) => {
		expect( isAllowedRedirectUrl( url ) ).toBe( true );
	} );

	test.each( [
		'https://evil.com',
		'https://my.wordpress.com.evil.com/path',
		'https://my.wordpress.com@evil.com/path',
		'https://my.wordpress.com.evil.com',
		'http://my.wordpress.com',
		'//evil.com/path',
		'/\\evil.com/path',
		'\\/evil.com/path',
		'\\\\evil.com/path',
		'https:/evil.com',
		'javascript:alert(1)',
		'blob:https://my.wordpress.com/x',
		'filesystem:https://my.wordpress.com/temporary/x',
		'relative-path',
		'https://relative-url-a.invalid/path',
		'//relative-url-a.invalid/path',
		'/\\relative-url-a.invalid/path',
		'///relative-url-a.invalid/path',
		'//relative-url-b.invalid/path',
		'',
	] )( 'rejects %s', ( url ) => {
		expect( isAllowedRedirectUrl( url ) ).toBe( false );
	} );
} );
