import fs from 'fs';
import path from 'path';
import { ALLOWED_ORIGINS, isAllowedRedirectUrl } from '../sign-in-with-apple';

describe( 'isAllowedRedirectUrl', () => {
	test.each( [
		'/',
		'/log-in/apple/callback',
		'/me/security/social-login',
		'/start/user?foo=bar',
		'https://my.wordpress.com',
		'https://my.wordpress.com/v2/me/security',
		'https://agencies-beta.automattic.com',
	] )( 'allows %s', ( url ) => {
		expect( isAllowedRedirectUrl( url ) ).toBe( true );
	} );

	test.each( [
		'https://evil.com',
		'https://my.wordpress.com.evil.com/path',
		'https://my.wordpress.com@evil.com/path',
		'https://my.wordpress.com.evil.com',
		'http://my.wordpress.com',
		'https://my.woo.ai',
		'https://my.woo.ai.evil.com',
		'http://my.woo.ai',
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

describe( 'sign-in-with-apple ALLOWED_ORIGINS', () => {
	test( 'matches the dashboard-production and dashboard-horizon hostname_allowlists', () => {
		const allowlist = new Set(
			[ 'dashboard-production', 'dashboard-horizon' ].flatMap(
				( env ) =>
					JSON.parse(
						fs.readFileSync(
							path.resolve( __dirname, '..', '..', '..', '..', 'config', `${ env }.json` ),
							'utf8'
						)
					).hostname_allowlist
			)
		);

		const hostnames = ALLOWED_ORIGINS.map( ( url ) => new URL( url ).hostname );

		expect( hostnames.sort() ).toEqual( [ ...allowlist ].sort() );
	} );
} );
