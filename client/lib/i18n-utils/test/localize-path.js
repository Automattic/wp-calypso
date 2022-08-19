import { localizePath } from '../localize-path';

describe( '#localizePath', () => {
	test( 'should not change URL for `en`', () => {
		[ '/', '/de/', '/start/', '/wp-login.php?action=lostpassword' ].forEach( ( fullUrl ) => {
			expect( localizePath( fullUrl, 'en' ) ).toEqual( fullUrl );
		} );
	} );

	test( 'should change relative URLs', () => {
		expect( localizePath( '/fr/themes' ) ).toEqual( '/fr/themes/' );
		expect( localizePath( '/fr/themes', 'en', false ) ).toEqual( '/fr/themes/' );
		expect( localizePath( '/fr/themes', 'es', true ) ).toEqual( '/fr/themes/' );
		expect( localizePath( '/fr/themes', 'fr', false ) ).toEqual( '/fr/themes/' );
		expect( localizePath( '/fr/themes', 'es', false ) ).toEqual( '/fr/themes/' );
		expect( localizePath( '/some/path', 'es', true ) ).toEqual( '/some/path/' );
		expect( localizePath( '/some/path', 'es', false ) ).toEqual( '/es/some/path/' );
		expect( localizePath( 'https://example.com', 'es', true ) ).toEqual( 'https://example.com/' );
		expect( localizePath( 'https://example.com', 'es', false ) ).toEqual( 'https://example.com/' );
		expect( localizePath( 'https://wordpress.com/themes', 'en', true ) ).toEqual( '/themes/' );
		expect( localizePath( 'https://wordpress.com/themes', 'es', true ) ).toEqual( '/themes/' );
		expect( localizePath( 'https://wordpress.com/themes', 'es', false ) ).toEqual( '/es/themes/' );
		expect( localizePath( localizePath( '/themes', 'de', false ), 'de', false ) ).toEqual(
			'/de/themes/'
		);
		expect( localizePath( localizePath( '/me/account', 'de', false ), 'de', false ) ).toEqual(
			'/me/account/'
		);
	} );

	test( 'handles invalid URLs', () => {
		[ undefined, null, [], {}, { href: 'https://test' }, () => {}, 'http://' ].forEach(
			( fullUrl ) => {
				expect( localizePath( fullUrl, 'en' ) ).toEqual( fullUrl );
				expect( localizePath( fullUrl, 'fr' ) ).toEqual( fullUrl );
			}
		);
	} );

	test( 'trailing slash variations', () => {
		expect( localizePath( '/cookies/', 'de' ) ).toEqual( '/de/cookies/' );
		expect( localizePath( '/cookies', 'de' ) ).toEqual( '/de/cookies/' );
	} );

	test( 'theme', () => {
		expect( localizePath( '/theme/maywood/', 'en', true ) ).toEqual( '/theme/maywood/' );
		expect( localizePath( '/theme/maywood/', 'de', true ) ).toEqual( '/theme/maywood/' );
		expect( localizePath( '/theme/maywood/', 'pl', true ) ).toEqual( '/theme/maywood/' );
		expect( localizePath( '/theme/maywood/', 'en', false ) ).toEqual( '/theme/maywood/' );
		expect( localizePath( '/theme/maywood/', 'de', false ) ).toEqual( '/de/theme/maywood/' );
		expect( localizePath( '/theme/maywood/', 'pl', false ) ).toEqual( '/theme/maywood/' );
		expect( localizePath( '/theme/maywood/setup/99999/', 'de', true ) ).toEqual(
			'/theme/maywood/setup/99999/'
		);
		expect( localizePath( '/theme/maywood/setup/99999/', 'de', false ) ).toEqual(
			'/de/theme/maywood/setup/99999/'
		);
	} );

	test( 'themes', () => {
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
