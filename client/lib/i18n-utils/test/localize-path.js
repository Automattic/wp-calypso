import { localizePath } from '../localize-path';

describe( '#localizePath', () => {
	test( 'should not change path for `en`', () => {
		[ '/', '/de/', '/start/', '/wp-login.php?action=lostpassword' ].forEach( ( path ) => {
			expect( localizePath( path, 'en' ) ).toEqual( path );
		} );
	} );

	test( 'should change path if specified', () => {
		expect( localizePath( '/wp-admin', 'en', false ) ).toEqual( '/wp-admin' );
		expect( localizePath( '/wp-admin', 'de', true ) ).toEqual( '/wp-admin' );
		expect( localizePath( '/wp-admin', 'de', false ) ).toEqual( '/wp-admin' );
		expect( localizePath( '/wp-login.php', 'es', false ) ).toEqual( '/wp-login.php' );

		expect( localizePath( '/log-in', 'es' ) ).toEqual( '/log-in' );
		expect( localizePath( '/log-in', 'es', false ) ).toEqual( '/log-in/es' );

		expect( localizePath( '/new', 'es' ) ).toEqual( '/new' );
		expect( localizePath( '/new', 'es', false ) ).toEqual( '/new/es' );

		expect( localizePath( '/setup', 'es' ) ).toEqual( '/setup' );
		expect( localizePath( '/setup', 'es', false ) ).toEqual( '/setup/es' );

		expect( localizePath( '/start', 'es' ) ).toEqual( '/start' );
		expect( localizePath( '/start', 'es', false ) ).toEqual( '/start/es' );

		expect( localizePath( '/start/user', 'es' ) ).toEqual( '/start/user' );
		expect( localizePath( '/start/user', 'es', false ) ).toEqual( '/start/user/es' );
		expect( localizePath( '/start/user/', 'es', false ) ).toEqual( '/start/user/es/' );

		expect( localizePath( '/some/path', 'es', true ) ).toEqual( '/some/path' );
		expect( localizePath( '/some/path', 'es', false ) ).toEqual( '/some/path' );

		expect( localizePath( localizePath( '/themes', 'de', false ), 'de', false ) ).toEqual(
			'/de/themes'
		);
		expect( localizePath( localizePath( '/me/account', 'de', false ), 'de', false ) ).toEqual(
			'/me/account'
		);
	} );

	test( 'handles full wordpress.com URLs', () => {
		expect( localizePath( 'https://example.com', 'es', true ) ).toEqual( 'https://example.com' );
		expect( localizePath( 'https://example.com', 'es', false ) ).toEqual( 'https://example.com' );
		expect( localizePath( 'https://wordpress.com/themes', 'en', true ) ).toEqual( '/themes' );
		expect( localizePath( 'https://wordpress.com/themes', 'es', true ) ).toEqual( '/themes' );
		expect( localizePath( 'https://wordpress.com/themes', 'es', false ) ).toEqual( '/es/themes' );
	} );

	test( 'handles invalid paths', () => {
		[ undefined, null, [], {}, { href: 'https://test' }, () => {}, 'http://' ].forEach(
			( fullUrl ) => {
				expect( localizePath( fullUrl, 'en' ) ).toEqual( fullUrl );
				expect( localizePath( fullUrl, 'fr' ) ).toEqual( fullUrl );
			}
		);
	} );

	test( 'trailing slash variations', () => {
		expect( localizePath( '/theme/', 'de', false ) ).toEqual( '/de/theme/' );
		expect( localizePath( '/theme', 'de', false ) ).toEqual( '/de/theme' );
	} );

	test( 'theme', () => {
		expect( localizePath( '/theme/maywood/', 'en', true ) ).toEqual( '/theme/maywood/' );
		expect( localizePath( '/theme/maywood/', 'de', true ) ).toEqual( '/theme/maywood/' );
		expect( localizePath( '/theme/maywood/', 'pl', true ) ).toEqual( '/theme/maywood/' );
		expect( localizePath( '/theme/maywood/', 'en', false ) ).toEqual( '/theme/maywood/' );
		expect( localizePath( '/theme/maywood/', 'de', false ) ).toEqual( '/de/theme/maywood/' );
		expect( localizePath( '/theme/maywood/', 'pl', false ) ).toEqual( '/theme/maywood/' );
		expect( localizePath( '/theme/maywood/setup/99999', 'de', true ) ).toEqual(
			'/theme/maywood/setup/99999'
		);
		expect( localizePath( '/theme/maywood/setup/99999/', 'de', false ) ).toEqual(
			'/de/theme/maywood/setup/99999/'
		);
	} );

	test( 'themes', () => {
		expect( localizePath( '/fr/themes' ) ).toEqual( '/fr/themes' );
		expect( localizePath( '/fr/themes', 'en', false ) ).toEqual( '/fr/themes' );
		expect( localizePath( '/fr/themes', 'fr', false ) ).toEqual( '/fr/themes' );

		expect( localizePath( 'themes', 'fr', true ) ).toEqual( '/themes' );
		expect( localizePath( 'themes', 'fr', false ) ).toEqual( '/fr/themes' );

		expect( localizePath( '/themes/', 'en', true ) ).toEqual( '/themes/' );
		expect( localizePath( '/themes/', 'de', true ) ).toEqual( '/themes/' );
		expect( localizePath( '/themes/', 'de', false ) ).toEqual( '/de/themes/' );
		expect( localizePath( '/themes/', 'pl', true ) ).toEqual( '/themes/' );
		expect( localizePath( '/themes/', 'en', false ) ).toEqual( '/themes/' );
		expect( localizePath( '/themes/', 'de', false ) ).toEqual( '/de/themes/' );
		expect( localizePath( '/themes/', 'pl', false ) ).toEqual( '/themes/' );
		expect( localizePath( '/themes/free/', 'de', true ) ).toEqual( '/themes/free/' );
		expect( localizePath( '/themes/free/', 'de', false ) ).toEqual( '/de/themes/free/' );
		expect( localizePath( '/themes/free/filter/example-filter/', 'de', true ) ).toEqual(
			'/themes/free/filter/example-filter/'
		);
		expect( localizePath( '/themes/free/filter/example-filter/', 'de', false ) ).toEqual(
			'/de/themes/free/filter/example-filter/'
		);
	} );
} );
