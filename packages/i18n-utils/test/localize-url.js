/**
 * Internal dependencies
 */
import { localizeUrl } from '../src';

// Mock only the getLocaleSlug function from i18n-calypso, and use
// original references for all the other functions
function mockFunctions() {
	const original = jest.requireActual( 'i18n-calypso' ).default;
	return Object.assign( Object.create( Object.getPrototypeOf( original ) ), original, {
		getLocaleSlug: jest.fn( () => 'en' ),
	} );
}
jest.mock( 'i18n-calypso', () => mockFunctions() );
const { getLocaleSlug } = jest.requireMock( 'i18n-calypso' );

describe( '#localizeUrl', () => {
	test( 'should not change URL for `en`', () => {
		[
			'https://wordpress.com/',
			'https://de.wordpress.com/',
			'https://wordpress.com/start/',
			'https://wordpress.com/wp-login.php?action=lostpassword',
		].forEach( ( fullUrl ) => {
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( fullUrl ) ).toEqual( fullUrl );
		} );
	} );

	test( 'should not change relative URLs', () => {
		[ '/me/account', '/settings' ].forEach( ( fullUrl ) => {
			getLocaleSlug.mockImplementationOnce( () => 'en' );
			expect( localizeUrl( fullUrl ) ).toEqual( fullUrl );
			getLocaleSlug.mockImplementationOnce( () => 'fr' );
			expect( localizeUrl( fullUrl ) ).toEqual( fullUrl );
		} );
	} );

	test( 'handles invalid URLs', () => {
		[ undefined, null, [], {}, { href: 'https://test' }, 'not-a-url', () => {} ].forEach(
			( fullUrl ) => {
				getLocaleSlug.mockImplementationOnce( () => 'en' );
				expect( localizeUrl( fullUrl ) ).toEqual( fullUrl );
				getLocaleSlug(); // make sure to consume it.
				getLocaleSlug.mockImplementationOnce( () => 'en' );
				expect( localizeUrl( fullUrl, 'fr' ) ).toEqual( fullUrl );
				getLocaleSlug(); // make sure to consume it.
				getLocaleSlug.mockImplementationOnce( () => 'fr' );
				expect( localizeUrl( fullUrl ) ).toEqual( fullUrl );
				getLocaleSlug(); // make sure to consume it.
			}
		);
	} );

	test( 'handles double localizeUrl', () => {
		getLocaleSlug.mockImplementationOnce( () => 'de' ).mockImplementationOnce( () => 'de' );
		expect( localizeUrl( localizeUrl( 'https://automattic.com/cookies/' ) ) ).toEqual(
			'https://automattic.com/de/cookies/'
		);
		getLocaleSlug();
		getLocaleSlug(); // make sure to consume it.

		getLocaleSlug.mockImplementationOnce( () => 'de' ).mockImplementationOnce( () => 'de' );
		expect(
			localizeUrl( localizeUrl( 'https://en.support.wordpress.com/all-about-domains/' ) )
		).toEqual( 'https://wordpress.com/de/support/all-about-domains/' );
		getLocaleSlug();
		getLocaleSlug(); // make sure to consume it.

		getLocaleSlug.mockImplementationOnce( () => 'de' ).mockImplementationOnce( () => 'de' );
		expect( localizeUrl( localizeUrl( 'https://wordpress.com/' ) ) ).toEqual(
			'https://de.wordpress.com/'
		);
		getLocaleSlug();
		getLocaleSlug(); // make sure to consume it.

		getLocaleSlug.mockImplementationOnce( () => 'de' ).mockImplementationOnce( () => 'de' );
		expect( localizeUrl( localizeUrl( 'https://en.blog.wordpress.com/' ) ) ).toEqual(
			'https://wordpress.com/blog/'
		);
		getLocaleSlug();
		getLocaleSlug(); // make sure to consume it.
	} );

	test( 'trailing slash variations', () => {
		getLocaleSlug.mockImplementationOnce( () => 'de' );
		expect( localizeUrl( 'https://automattic.com/cookies/' ) ).toEqual(
			'https://automattic.com/de/cookies/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'de' );
		expect( localizeUrl( 'https://automattic.com/cookies' ) ).toEqual(
			'https://automattic.com/de/cookies/'
		);
	} );

	test( 'overriding locale', () => {
		getLocaleSlug.mockImplementationOnce( () => 'ru' );
		expect( localizeUrl( 'https://automattic.com/cookies/', 'de' ) ).toEqual(
			'https://automattic.com/de/cookies/'
		);
		getLocaleSlug(); // make sure to consume it.

		getLocaleSlug.mockImplementationOnce( () => 'en' );
		expect( localizeUrl( 'https://automattic.com/cookies', 'fr' ) ).toEqual(
			'https://automattic.com/fr/cookies/'
		);
		getLocaleSlug(); // make sure to consume it.

		// Finally make sure that no overriding has stuck and it uses the getLocaleSlug() when no override is specified.
		getLocaleSlug.mockImplementationOnce( () => 'ru' );
		expect( localizeUrl( 'https://automattic.com/cookies/' ) ).toEqual(
			'https://automattic.com/cookies/'
		);
		getLocaleSlug(); // make sure to consume it.

		getLocaleSlug.mockImplementationOnce( () => 'de' );
		expect( localizeUrl( 'https://automattic.com/cookies/' ) ).toEqual(
			'https://automattic.com/de/cookies/'
		);
		getLocaleSlug(); // make sure to consume it.
	} );

	test( 'logged-out homepage', () => {
		getLocaleSlug.mockImplementationOnce( () => 'en' );
		expect( localizeUrl( 'https://wordpress.com/' ) ).toEqual( 'https://wordpress.com/' );
		getLocaleSlug.mockImplementationOnce( () => 'de' );
		expect( localizeUrl( 'https://wordpress.com/' ) ).toEqual( 'https://de.wordpress.com/' );
		getLocaleSlug.mockImplementationOnce( () => 'pt-br' );
		expect( localizeUrl( 'https://wordpress.com/' ) ).toEqual( 'https://br.wordpress.com/' );
		getLocaleSlug.mockImplementationOnce( () => 'pl' );
		expect( localizeUrl( 'https://wordpress.com/' ) ).toEqual( 'https://wordpress.com/' );
		getLocaleSlug.mockImplementationOnce( () => 'en' );
		expect( localizeUrl( 'https://en.wordpress.com/' ) ).toEqual( 'https://wordpress.com/' );
	} );

	test( 'blog url', () => {
		getLocaleSlug.mockImplementationOnce( () => 'en' );
		expect( localizeUrl( 'https://en.blog.wordpress.com/' ) ).toEqual(
			'https://wordpress.com/blog/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'de' );
		expect( localizeUrl( 'https://en.blog.wordpress.com/' ) ).toEqual(
			'https://wordpress.com/blog/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'pt-br' );
		expect( localizeUrl( 'https://en.blog.wordpress.com/' ) ).toEqual(
			'https://wordpress.com/br/blog/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'pl' );
		expect( localizeUrl( 'https://en.blog.wordpress.com/' ) ).toEqual(
			'https://wordpress.com/blog/'
		);
		// Don't rewrite specific blog posts
		getLocaleSlug.mockImplementationOnce( () => 'pt-br' );
		expect( localizeUrl( 'https://en.blog.wordpress.com/2020/01/01/test/' ) ).toEqual(
			'https://wordpress.com/blog/2020/01/01/test/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'pt-br' );
		expect( localizeUrl( 'https://wordpress.com/blog/2020/01/01/test/' ) ).toEqual(
			'https://wordpress.com/blog/2020/01/01/test/'
		);
	} );

	test( 'support url', () => {
		getLocaleSlug.mockImplementationOnce( () => 'en' );
		expect( localizeUrl( 'https://en.support.wordpress.com/' ) ).toEqual(
			'https://wordpress.com/support/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'de' );
		expect( localizeUrl( 'https://en.support.wordpress.com/' ) ).toEqual(
			'https://wordpress.com/de/support/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'pt-br' );
		expect( localizeUrl( 'https://en.support.wordpress.com/' ) ).toEqual(
			'https://wordpress.com/br/support/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'pl' );
		expect( localizeUrl( 'https://en.support.wordpress.com/' ) ).toEqual(
			'https://wordpress.com/support/'
		);

		getLocaleSlug.mockImplementationOnce( () => 'en' );
		expect( localizeUrl( 'https://en.support.wordpress.com/path/' ) ).toEqual(
			'https://wordpress.com/support/path/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'de' );
		expect( localizeUrl( 'https://en.support.wordpress.com/path/' ) ).toEqual(
			'https://wordpress.com/de/support/path/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'pt-br' );
		expect( localizeUrl( 'https://en.support.wordpress.com/path/' ) ).toEqual(
			'https://wordpress.com/br/support/path/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'pl' );
		expect( localizeUrl( 'https://en.support.wordpress.com/path/' ) ).toEqual(
			'https://wordpress.com/support/path/'
		);

		getLocaleSlug.mockImplementationOnce( () => 'en' );
		expect( localizeUrl( 'https://en.support.wordpress.com/' ) ).toEqual(
			'https://wordpress.com/support/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'de' );
		expect( localizeUrl( 'https://en.support.wordpress.com/' ) ).toEqual(
			'https://wordpress.com/de/support/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'pt-br' );
		expect( localizeUrl( 'https://en.support.wordpress.com/' ) ).toEqual(
			'https://wordpress.com/br/support/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'pl' );
		expect( localizeUrl( 'https://en.support.wordpress.com/' ) ).toEqual(
			'https://wordpress.com/support/'
		);

		getLocaleSlug.mockImplementationOnce( () => 'en' );
		expect( localizeUrl( 'https://en.support.wordpress.com/path/' ) ).toEqual(
			'https://wordpress.com/support/path/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'de' );
		expect( localizeUrl( 'https://en.support.wordpress.com/path/' ) ).toEqual(
			'https://wordpress.com/de/support/path/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'pt-br' );
		expect( localizeUrl( 'https://en.support.wordpress.com/path/' ) ).toEqual(
			'https://wordpress.com/br/support/path/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'pl' );
		expect( localizeUrl( 'https://en.support.wordpress.com/path/' ) ).toEqual(
			'https://wordpress.com/support/path/'
		);
	} );

	test( 'forums url', () => {
		getLocaleSlug.mockImplementationOnce( () => 'en' );
		expect( localizeUrl( 'https://en.forums.wordpress.com/' ) ).toEqual(
			'https://en.forums.wordpress.com/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'de' );
		expect( localizeUrl( 'https://en.forums.wordpress.com/' ) ).toEqual(
			'https://de.forums.wordpress.com/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'pt-br' );
		expect( localizeUrl( 'https://en.forums.wordpress.com/' ) ).toEqual(
			'https://br.forums.wordpress.com/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'th' );
		expect( localizeUrl( 'https://en.forums.wordpress.com/' ) ).toEqual(
			'https://th.forums.wordpress.com/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'pl' );
		expect( localizeUrl( 'https://en.forums.wordpress.com/' ) ).toEqual(
			'https://en.forums.wordpress.com/'
		);
	} );

	test( 'privacy policy', () => {
		getLocaleSlug.mockImplementationOnce( () => 'en' );
		expect( localizeUrl( 'https://automattic.com/privacy/' ) ).toEqual(
			'https://automattic.com/privacy/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'de' );
		expect( localizeUrl( 'https://automattic.com/privacy/' ) ).toEqual(
			'https://automattic.com/de/privacy/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'pl' );
		expect( localizeUrl( 'https://automattic.com/privacy/' ) ).toEqual(
			'https://automattic.com/privacy/'
		);
	} );

	test( 'cookie policy', () => {
		getLocaleSlug.mockImplementationOnce( () => 'en' );
		expect( localizeUrl( 'https://automattic.com/cookies/' ) ).toEqual(
			'https://automattic.com/cookies/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'de' );
		expect( localizeUrl( 'https://automattic.com/cookies/' ) ).toEqual(
			'https://automattic.com/de/cookies/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'pl' );
		expect( localizeUrl( 'https://automattic.com/cookies/' ) ).toEqual(
			'https://automattic.com/cookies/'
		);
	} );

	test( 'tos', () => {
		getLocaleSlug.mockImplementationOnce( () => 'en' );
		expect( localizeUrl( 'https://wordpress.com/tos/' ) ).toEqual( 'https://wordpress.com/tos/' );
		getLocaleSlug.mockImplementationOnce( () => 'de' );
		expect( localizeUrl( 'https://wordpress.com/tos/' ) ).toEqual(
			'https://de.wordpress.com/tos/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'pl' );
		expect( localizeUrl( 'https://wordpress.com/tos/' ) ).toEqual( 'https://wordpress.com/tos/' );
		getLocaleSlug.mockImplementationOnce( () => 'th' );
		expect( localizeUrl( 'https://wordpress.com/tos/' ) ).toEqual( 'https://wordpress.com/tos/' );
	} );

	test( 'jetpack', () => {
		getLocaleSlug.mockImplementationOnce( () => 'en' );
		expect( localizeUrl( 'https://jetpack.com/features/comparison/' ) ).toEqual(
			'https://jetpack.com/features/comparison/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'de' );
		expect( localizeUrl( 'https://jetpack.com/features/comparison/' ) ).toEqual(
			'https://de.jetpack.com/features/comparison/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'pt-br' );
		expect( localizeUrl( 'https://jetpack.com/features/comparison/' ) ).toEqual(
			'https://br.jetpack.com/features/comparison/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'zh-tw' );
		expect( localizeUrl( 'https://jetpack.com/features/comparison/' ) ).toEqual(
			'https://zh-tw.jetpack.com/features/comparison/'
		);
		getLocaleSlug.mockImplementationOnce( () => 'pl' );
		expect( localizeUrl( 'https://jetpack.com/features/comparison/' ) ).toEqual(
			'https://jetpack.com/features/comparison/'
		);
	} );

	test( 'WordPress.com URLs', () => {
		getLocaleSlug.mockImplementationOnce( () => 'en' );
		expect( localizeUrl( 'https://wordpress.com/wp-login.php?action=lostpassword' ) ).toEqual(
			'https://wordpress.com/wp-login.php?action=lostpassword'
		);
		getLocaleSlug.mockImplementationOnce( () => 'de' );
		expect( localizeUrl( 'https://wordpress.com/wp-login.php?action=lostpassword' ) ).toEqual(
			'https://de.wordpress.com/wp-login.php?action=lostpassword'
		);
	} );

	test( 'WordPress.com new style support URLs', () => {
		expect( localizeUrl( 'https://wordpress.com/support/reader/', 'de' ) ).toEqual(
			'https://wordpress.com/de/support/reader/'
		);
		expect( localizeUrl( 'https://wordpress.com/support/reader/#blocking-sites', 'de' ) ).toEqual(
			'https://wordpress.com/de/support/reader/#blocking-sites'
		);
	} );
} );
