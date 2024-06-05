/**
 * @jest-environment jsdom
 */
/* eslint-disable no-shadow -- shadowing localizeUrl makes tests readable */
import { renderHook } from '@testing-library/react';
import { localizeUrl, useLocalizeUrl } from '../';

jest.mock( '../locale-context', () => {
	const original = jest.requireActual( '../locale-context' );
	return Object.assign( Object.create( Object.getPrototypeOf( original ) ), original, {
		useLocale: jest.fn( () => 'en' ),
	} );
} );

const { useLocale } = jest.requireMock( '../locale-context' );

describe( '#localizeUrl', () => {
	function testLocalizeUrl( locale = 'en' ) {
		// Replace the locale given by `useLocale()` with the mocked locale, return a new versio nof localizeUrl
		useLocale.mockImplementation( () => locale );
		const {
			result: { current: localizeUrl },
		} = renderHook( () => useLocalizeUrl() ); // eslint-disable-line react-hooks/rules-of-hooks -- being called within renderHook context
		return localizeUrl;
	}

	test( 'should use useLocale for current provider locale as the switch to locale when none is specified', () => {
		let localizeUrl;

		localizeUrl = testLocalizeUrl( 'pt-br' );
		expect( localizeUrl( 'https://en.forums.wordpress.com/' ) ).toEqual(
			'https://wordpress.com/pt-br/forums/'
		);
		expect( localizeUrl( 'https://wordpress.com/forums/' ) ).toEqual(
			'https://wordpress.com/pt-br/forums/'
		);
		localizeUrl = testLocalizeUrl( 'en' );
		expect( localizeUrl( 'https://en.forums.wordpress.com/' ) ).toEqual(
			'https://wordpress.com/forums/'
		);
	} );

	test( 'should not change URL for `en`', () => {
		[
			'https://wordpress.com/',
			'https://wordpress.com/de/',
			'https://wordpress.com/start/',
			'https://wordpress.com/wp-login.php?action=lostpassword',
		].forEach( ( fullUrl ) => {
			expect( localizeUrl( fullUrl, 'en' ) ).toEqual( fullUrl );
		} );
	} );

	test( 'should not change relative URLs', () => {
		[ '/me/account', '/settings' ].forEach( ( fullUrl ) => {
			expect( localizeUrl( fullUrl, 'en' ) ).toEqual( fullUrl );
			expect( localizeUrl( fullUrl, 'fr' ) ).toEqual( fullUrl );
		} );
	} );

	test( 'handles invalid URLs', () => {
		[ undefined, null, [], {}, { href: 'https://test' }, 'not-a-url', () => {}, 'http://' ].forEach(
			( fullUrl ) => {
				expect( localizeUrl( fullUrl, 'en' ) ).toEqual( fullUrl );
				expect( localizeUrl( fullUrl, 'fr' ) ).toEqual( fullUrl );
			}
		);
	} );

	test( 'handles double localizeUrl', () => {
		expect( localizeUrl( localizeUrl( 'https://automattic.com/cookies/', 'de' ), 'de' ) ).toEqual(
			'https://automattic.com/de/cookies/'
		);
		expect(
			localizeUrl(
				localizeUrl( 'https://en.support.wordpress.com/all-about-domains/', 'de' ),
				'de'
			)
		).toEqual( 'https://wordpress.com/de/support/all-about-domains/' );

		expect( localizeUrl( localizeUrl( 'https://wordpress.com/', 'de' ), 'de' ) ).toEqual(
			'https://wordpress.com/de/'
		);
		expect( localizeUrl( localizeUrl( 'https://en.blog.wordpress.com/', 'de' ), 'de' ) ).toEqual(
			'https://wordpress.com/blog/'
		);
	} );

	test( 'trailing slash variations', () => {
		const isLoggedIn = false;

		// Add trailing slashes everywhere (default).
		expect( localizeUrl( 'https://automattic.com/cookies/', 'de', isLoggedIn ) ).toEqual(
			'https://automattic.com/de/cookies/'
		);
		expect( localizeUrl( 'https://automattic.com/cookies', 'de', isLoggedIn ) ).toEqual(
			'https://automattic.com/de/cookies/'
		);
		expect( localizeUrl( 'https://automattic.com/cookies?foo=bar', 'de', isLoggedIn ) ).toEqual(
			'https://automattic.com/de/cookies/?foo=bar'
		);
		expect( localizeUrl( 'https://automattic.com/cookies#baz', 'de', isLoggedIn ) ).toEqual(
			'https://automattic.com/de/cookies/#baz'
		);

		// Preserve trailing slash variation.
		expect( localizeUrl( 'https://automattic.com/cookies/', 'de', isLoggedIn, true ) ).toEqual(
			'https://automattic.com/de/cookies/'
		);
		expect( localizeUrl( 'https://automattic.com/cookies', 'de', isLoggedIn, true ) ).toEqual(
			'https://automattic.com/de/cookies'
		);
		expect(
			localizeUrl( 'https://automattic.com/cookies?foo=bar', 'de', isLoggedIn, true )
		).toEqual( 'https://automattic.com/de/cookies?foo=bar' );
		expect( localizeUrl( 'https://automattic.com/cookies#baz', 'de', isLoggedIn, true ) ).toEqual(
			'https://automattic.com/de/cookies#baz'
		);
	} );

	test( 'logged-out homepage', () => {
		expect( localizeUrl( 'https://wordpress.com/', 'en' ) ).toEqual( 'https://wordpress.com/' );
		expect( localizeUrl( 'https://wordpress.com/', 'de' ) ).toEqual( 'https://wordpress.com/de/' );
		expect( localizeUrl( 'https://wordpress.com/', 'pt-br' ) ).toEqual(
			'https://wordpress.com/pt-br/'
		);
		expect( localizeUrl( 'https://wordpress.com/', 'pl' ) ).toEqual( 'https://wordpress.com/' );

		expect( localizeUrl( 'https://en.wordpress.com/', 'en' ) ).toEqual( 'https://wordpress.com/' );
	} );

	test( 'calypso standard URLs', () => {
		expect( localizeUrl( 'https://wordpress.com/checkout/', 'en' ) ).toEqual(
			'https://wordpress.com/checkout/'
		);
		expect( localizeUrl( 'https://wordpress.com/checkout/', 'es' ) ).toEqual(
			'https://wordpress.com/checkout/'
		);
		expect(
			localizeUrl( 'https://wordpress.com/checkout/offer-quickstart-session/', 'en' )
		).toEqual( 'https://wordpress.com/checkout/offer-quickstart-session/' );
		expect(
			localizeUrl( 'https://wordpress.com/checkout/offer-quickstart-session/', 'es' )
		).toEqual( 'https://wordpress.com/checkout/offer-quickstart-session/' );

		expect( localizeUrl( 'https://wordpress.com/me', 'en' ) ).toEqual(
			'https://wordpress.com/me/'
		);
		expect( localizeUrl( 'https://wordpress.com/me', 'es' ) ).toEqual(
			'https://wordpress.com/me/'
		);
		expect( localizeUrl( 'https://wordpress.com/me/', 'en' ) ).toEqual(
			'https://wordpress.com/me/'
		);
		expect( localizeUrl( 'https://wordpress.com/me/', 'es' ) ).toEqual(
			'https://wordpress.com/me/'
		);
		expect( localizeUrl( 'https://wordpress.com/me/account', 'en' ) ).toEqual(
			'https://wordpress.com/me/account/'
		);
		expect( localizeUrl( 'https://wordpress.com/me/account', 'es' ) ).toEqual(
			'https://wordpress.com/me/account/'
		);

		expect( localizeUrl( 'https://wordpress.com/home/test.wordpress.com', 'en' ) ).toEqual(
			'https://wordpress.com/home/test.wordpress.com/'
		);
		expect( localizeUrl( 'https://wordpress.com/home/test.wordpress.com', 'es' ) ).toEqual(
			'https://wordpress.com/home/test.wordpress.com/'
		);
		expect(
			localizeUrl( 'https://wordpress.com/not-really-a-calypso-path/test.blog', 'en' )
		).toEqual( 'https://wordpress.com/not-really-a-calypso-path/test.blog/' );
		expect(
			localizeUrl( 'https://wordpress.com/not-really-a-calypso-path/test.blog', 'es' )
		).toEqual( 'https://wordpress.com/not-really-a-calypso-path/test.blog/' );
	} );

	test( 'blog url', () => {
		expect( localizeUrl( 'https://en.blog.wordpress.com/', 'en' ) ).toEqual(
			'https://wordpress.com/blog/'
		);
		expect( localizeUrl( 'https://en.blog.wordpress.com/', 'de' ) ).toEqual(
			'https://wordpress.com/blog/'
		);
		expect( localizeUrl( 'https://en.blog.wordpress.com/', 'pt-br' ) ).toEqual(
			'https://wordpress.com/pt-br/blog/'
		);
		expect( localizeUrl( 'https://en.blog.wordpress.com/', 'pl' ) ).toEqual(
			'https://wordpress.com/blog/'
		);
		// Don't rewrite specific blog posts
		expect( localizeUrl( 'https://en.blog.wordpress.com/2020/01/01/test/', 'pt-br' ) ).toEqual(
			'https://wordpress.com/blog/2020/01/01/test/'
		);
		expect( localizeUrl( 'https://wordpress.com/blog/2020/01/01/test/', 'pt-br' ) ).toEqual(
			'https://wordpress.com/blog/2020/01/01/test/'
		);
	} );

	test( 'go blog url', () => {
		expect( localizeUrl( 'https://wordpress.com/go/', 'en' ) ).toEqual(
			'https://wordpress.com/go/'
		);
		// Locales without a Go blog.
		expect( localizeUrl( 'https://wordpress.com/go/', 'sv' ) ).toEqual(
			'https://wordpress.com/go/'
		);
		expect( localizeUrl( 'https://wordpress.com/go/', 'pl' ) ).toEqual(
			'https://wordpress.com/go/'
		);
		// Locales with a Go blog.
		expect( localizeUrl( 'https://wordpress.com/go/', 'pt-br' ) ).toEqual(
			'https://wordpress.com/pt-br/go/'
		);
		expect( localizeUrl( 'https://wordpress.com/go/', 'es' ) ).toEqual(
			'https://wordpress.com/es/go/'
		);
		// Rewrite specific posts only for Spanish.
		expect( localizeUrl( 'https://wordpress.com/go/category/a-post/', 'pt-br' ) ).toEqual(
			'https://wordpress.com/go/category/a-post/'
		);
		expect( localizeUrl( 'https://wordpress.com/go/category/a-post/', 'pl' ) ).toEqual(
			'https://wordpress.com/go/category/a-post/'
		);
		expect( localizeUrl( 'https://wordpress.com/go/category/a-post/', 'es' ) ).toEqual(
			'https://wordpress.com/es/go/category/a-post/'
		);
	} );

	test( 'support url', () => {
		expect( localizeUrl( 'https://en.support.wordpress.com/', 'en' ) ).toEqual(
			'https://wordpress.com/support/'
		);
		expect( localizeUrl( 'https://en.support.wordpress.com/', 'de' ) ).toEqual(
			'https://wordpress.com/de/support/'
		);
		expect( localizeUrl( 'https://en.support.wordpress.com/', 'pt-br' ) ).toEqual(
			'https://wordpress.com/pt-br/support/'
		);
		expect( localizeUrl( 'https://en.support.wordpress.com/', 'pl' ) ).toEqual(
			'https://wordpress.com/support/'
		);

		expect( localizeUrl( 'https://en.support.wordpress.com/path/', 'en' ) ).toEqual(
			'https://wordpress.com/support/path/'
		);
		expect( localizeUrl( 'https://en.support.wordpress.com/path/', 'de' ) ).toEqual(
			'https://wordpress.com/de/support/path/'
		);
		expect( localizeUrl( 'https://en.support.wordpress.com/path/', 'pt-br' ) ).toEqual(
			'https://wordpress.com/pt-br/support/path/'
		);
		expect( localizeUrl( 'https://en.support.wordpress.com/path/', 'pl' ) ).toEqual(
			'https://wordpress.com/support/path/'
		);

		expect( localizeUrl( 'https://en.support.wordpress.com/', 'en' ) ).toEqual(
			'https://wordpress.com/support/'
		);
		expect( localizeUrl( 'https://en.support.wordpress.com/', 'de' ) ).toEqual(
			'https://wordpress.com/de/support/'
		);

		expect( localizeUrl( 'https://en.support.wordpress.com/', 'pt-br' ) ).toEqual(
			'https://wordpress.com/pt-br/support/'
		);
		expect( localizeUrl( 'https://en.support.wordpress.com/', 'pl' ) ).toEqual(
			'https://wordpress.com/support/'
		);

		expect( localizeUrl( 'https://en.support.wordpress.com/path/', 'en' ) ).toEqual(
			'https://wordpress.com/support/path/'
		);
		expect( localizeUrl( 'https://en.support.wordpress.com/path/', 'de' ) ).toEqual(
			'https://wordpress.com/de/support/path/'
		);
		expect( localizeUrl( 'https://en.support.wordpress.com/path/', 'pt-br' ) ).toEqual(
			'https://wordpress.com/pt-br/support/path/'
		);
		expect( localizeUrl( 'https://en.support.wordpress.com/path/', 'pl' ) ).toEqual(
			'https://wordpress.com/support/path/'
		);
	} );

	test( 'forums url', () => {
		expect( localizeUrl( 'https://en.forums.wordpress.com/', 'en' ) ).toEqual(
			'https://wordpress.com/forums/'
		);
		expect( localizeUrl( 'https://en.forums.wordpress.com/', 'de' ) ).toEqual(
			'https://wordpress.com/de/forums/'
		);
		expect( localizeUrl( 'https://en.forums.wordpress.com/', 'pt-br' ) ).toEqual(
			'https://wordpress.com/pt-br/forums/'
		);
		expect( localizeUrl( 'https://en.forums.wordpress.com/', 'th' ) ).toEqual(
			'https://wordpress.com/th/forums/'
		);
		expect( localizeUrl( 'https://en.forums.wordpress.com/', 'pl' ) ).toEqual(
			'https://wordpress.com/forums/'
		);
		expect( localizeUrl( 'https://wordpress.com/forums/', 'en' ) ).toEqual(
			'https://wordpress.com/forums/'
		);
		expect( localizeUrl( 'https://wordpress.com/forums/', 'de' ) ).toEqual(
			'https://wordpress.com/de/forums/'
		);
		expect( localizeUrl( 'https://wordpress.com/forums/', 'pt-br' ) ).toEqual(
			'https://wordpress.com/pt-br/forums/'
		);
		expect( localizeUrl( 'https://wordpress.com/forums/', 'th' ) ).toEqual(
			'https://wordpress.com/th/forums/'
		);
		expect( localizeUrl( 'https://wordpress.com/forums/', 'pl' ) ).toEqual(
			'https://wordpress.com/forums/'
		);
	} );

	test( 'privacy policy', () => {
		expect( localizeUrl( 'https://automattic.com/privacy/', 'en' ) ).toEqual(
			'https://automattic.com/privacy/'
		);
		expect( localizeUrl( 'https://automattic.com/privacy/', 'de' ) ).toEqual(
			'https://automattic.com/de/privacy/'
		);
		expect( localizeUrl( 'https://automattic.com/privacy/', 'pl' ) ).toEqual(
			'https://automattic.com/privacy/'
		);
	} );

	test( 'cookie policy', () => {
		expect( localizeUrl( 'https://automattic.com/cookies/', 'en' ) ).toEqual(
			'https://automattic.com/cookies/'
		);
		expect( localizeUrl( 'https://automattic.com/cookies/', 'de' ) ).toEqual(
			'https://automattic.com/de/cookies/'
		);
		expect( localizeUrl( 'https://automattic.com/cookies/', 'pl' ) ).toEqual(
			'https://automattic.com/cookies/'
		);
	} );

	test( 'theme', () => {
		expect( localizeUrl( 'https://wordpress.com/theme/maywood/', 'en', true ) ).toEqual(
			'https://wordpress.com/theme/maywood/'
		);
		expect( localizeUrl( 'https://wordpress.com/theme/maywood/', 'de', true ) ).toEqual(
			'https://wordpress.com/theme/maywood/'
		);
		expect( localizeUrl( 'https://wordpress.com/theme/maywood/', 'pl', true ) ).toEqual(
			'https://wordpress.com/theme/maywood/'
		);
		expect( localizeUrl( 'https://wordpress.com/theme/maywood/', 'en', false ) ).toEqual(
			'https://wordpress.com/theme/maywood/'
		);
		expect( localizeUrl( 'https://wordpress.com/theme/maywood/', 'de', false ) ).toEqual(
			'https://wordpress.com/de/theme/maywood/'
		);
		expect( localizeUrl( 'https://wordpress.com/theme/maywood/', 'pl', false ) ).toEqual(
			'https://wordpress.com/theme/maywood/'
		);
		expect( localizeUrl( 'https://wordpress.com/theme/maywood/setup/99999/', 'de', true ) ).toEqual(
			'https://wordpress.com/theme/maywood/setup/99999/'
		);
		expect(
			localizeUrl( 'https://wordpress.com/theme/maywood/setup/99999/', 'de', false )
		).toEqual( 'https://wordpress.com/de/theme/maywood/setup/99999/' );
	} );

	test( 'themes', () => {
		expect( localizeUrl( 'https://wordpress.com/themes/', 'en', true ) ).toEqual(
			'https://wordpress.com/themes/'
		);
		expect( localizeUrl( 'https://wordpress.com/themes/', 'de', true ) ).toEqual(
			'https://wordpress.com/themes/'
		);
		expect( localizeUrl( 'https://wordpress.com/themes/', 'pl', true ) ).toEqual(
			'https://wordpress.com/themes/'
		);
		expect( localizeUrl( 'https://wordpress.com/themes/', 'en', false ) ).toEqual(
			'https://wordpress.com/themes/'
		);
		expect( localizeUrl( 'https://wordpress.com/themes/', 'de', false ) ).toEqual(
			'https://wordpress.com/de/themes/'
		);
		expect( localizeUrl( 'https://wordpress.com/themes/', 'pl', false ) ).toEqual(
			'https://wordpress.com/themes/'
		);
		expect( localizeUrl( 'https://wordpress.com/themes/free/', 'de', true ) ).toEqual(
			'https://wordpress.com/themes/free/'
		);
		expect( localizeUrl( 'https://wordpress.com/themes/free/', 'de', false ) ).toEqual(
			'https://wordpress.com/de/themes/free/'
		);
		expect(
			localizeUrl( 'https://wordpress.com/themes/free/filter/example-filter/', 'de', true )
		).toEqual( 'https://wordpress.com/themes/free/filter/example-filter/' );
		expect(
			localizeUrl( 'https://wordpress.com/themes/free/filter/example-filter/', 'de', false )
		).toEqual( 'https://wordpress.com/de/themes/free/filter/example-filter/' );
	} );

	test( 'start', () => {
		expect( localizeUrl( 'https://wordpress.com/start/', 'en', true ) ).toEqual(
			'https://wordpress.com/start/'
		);
		expect( localizeUrl( 'https://wordpress.com/start/', 'de', true ) ).toEqual(
			'https://wordpress.com/start/'
		);
		expect( localizeUrl( 'https://wordpress.com/start/', 'pl', true ) ).toEqual(
			'https://wordpress.com/start/'
		);
		expect( localizeUrl( 'https://wordpress.com/start/', 'en', false ) ).toEqual(
			'https://wordpress.com/start/'
		);
		expect( localizeUrl( 'https://wordpress.com/start/', 'de', false ) ).toEqual(
			'https://wordpress.com/start/de/'
		);
		expect( localizeUrl( 'https://wordpress.com/start/', 'pl', false ) ).toEqual(
			'https://wordpress.com/start/'
		);
		expect( localizeUrl( 'https://wordpress.com/start/user/', 'de', true ) ).toEqual(
			'https://wordpress.com/start/user/'
		);
		expect( localizeUrl( 'https://wordpress.com/start/user/', 'de', false ) ).toEqual(
			'https://wordpress.com/start/user/de/'
		);
		expect( localizeUrl( 'https://wordpress.com/start/user/', 'pl', false ) ).toEqual(
			'https://wordpress.com/start/user/'
		);
	} );

	test( 'learn', () => {
		expect( localizeUrl( 'https://wordpress.com/learn/', 'en', true ) ).toEqual(
			'https://wordpress.com/learn/'
		);
		expect( localizeUrl( 'https://wordpress.com/learn/', 'en', false ) ).toEqual(
			'https://wordpress.com/learn/'
		);
		expect( localizeUrl( 'https://wordpress.com/learn/', 'pl', true ) ).toEqual(
			'https://wordpress.com/learn/'
		);
		expect( localizeUrl( 'https://wordpress.com/learn/', 'pl', false ) ).toEqual(
			'https://wordpress.com/learn/'
		);
		expect( localizeUrl( 'https://wordpress.com/learn/', 'es', true ) ).toEqual(
			'https://wordpress.com/learn/es/'
		);
		expect( localizeUrl( 'https://wordpress.com/learn/', 'es', false ) ).toEqual(
			'https://wordpress.com/learn/es/'
		);
		expect( localizeUrl( 'https://wordpress.com/learn/webinars/', 'en', true ) ).toEqual(
			'https://wordpress.com/learn/webinars/'
		);
		expect( localizeUrl( 'https://wordpress.com/learn/webinars/', 'en', false ) ).toEqual(
			'https://wordpress.com/learn/webinars/'
		);
		expect( localizeUrl( 'https://wordpress.com/learn/webinars/', 'es', true ) ).toEqual(
			'https://wordpress.com/learn/es/webinars/'
		);
		expect( localizeUrl( 'https://wordpress.com/learn/webinars/', 'es', false ) ).toEqual(
			'https://wordpress.com/learn/es/webinars/'
		);
		expect( localizeUrl( 'https://wordpress.com/learn/webinars/', 'pl', true ) ).toEqual(
			'https://wordpress.com/learn/webinars/'
		);
		expect( localizeUrl( 'https://wordpress.com/learn/webinars/', 'pl', false ) ).toEqual(
			'https://wordpress.com/learn/webinars/'
		);
	} );
	test( 'tos', () => {
		expect( localizeUrl( 'https://wordpress.com/tos/', 'en' ) ).toEqual(
			'https://wordpress.com/tos/'
		);
		expect( localizeUrl( 'https://wordpress.com/tos/', 'de' ) ).toEqual(
			'https://wordpress.com/de/tos/'
		);
		expect( localizeUrl( 'https://wordpress.com/tos/', 'pt-br' ) ).toEqual(
			'https://wordpress.com/pt-br/tos/'
		);
		expect( localizeUrl( 'https://wordpress.com/tos/', 'pl' ) ).toEqual(
			'https://wordpress.com/tos/'
		);
		expect( localizeUrl( 'https://wordpress.com/tos/', 'th' ) ).toEqual(
			'https://wordpress.com/tos/'
		);
	} );

	test( 'pricing', () => {
		expect( localizeUrl( 'https://wordpress.com/pricing/', 'en' ) ).toEqual(
			'https://wordpress.com/pricing/'
		);
		expect( localizeUrl( 'https://wordpress.com/pricing/', 'fr' ) ).toEqual(
			'https://wordpress.com/fr/pricing/'
		);
		expect( localizeUrl( 'https://wordpress.com/pricing/', 'pt-br' ) ).toEqual(
			'https://wordpress.com/pt-br/pricing/'
		);
		expect( localizeUrl( 'https://wordpress.com/pricing/', 'zh-tw' ) ).toEqual(
			'https://wordpress.com/zh-tw/pricing/'
		);
		expect( localizeUrl( 'https://wordpress.com/pricing/', 'xx' ) ).toEqual(
			'https://wordpress.com/pricing/'
		);
	} );

	test( 'jetpack', () => {
		expect( localizeUrl( 'https://jetpack.com/features/comparison/', 'en' ) ).toEqual(
			'https://jetpack.com/features/comparison/'
		);
		expect( localizeUrl( 'https://jetpack.com/features/comparison/', 'de' ) ).toEqual(
			'https://jetpack.com/de/features/comparison/'
		);
		expect( localizeUrl( 'https://jetpack.com/features/comparison/', 'pt-br' ) ).toEqual(
			'https://jetpack.com/pt-br/features/comparison/'
		);
		expect( localizeUrl( 'https://jetpack.com/features/comparison/', 'zh-tw' ) ).toEqual(
			'https://jetpack.com/zh-tw/features/comparison/'
		);
		expect( localizeUrl( 'https://jetpack.com/features/comparison/', 'pl' ) ).toEqual(
			'https://jetpack.com/features/comparison/'
		);
	} );

	test( 'cloud.jetpack.com', () => {
		expect( localizeUrl( 'https://cloud.jetpack.com/pricing/', 'en' ) ).toEqual(
			'https://cloud.jetpack.com/pricing/'
		);
		expect( localizeUrl( 'https://cloud.jetpack.com/pricing/', 'fr' ) ).toEqual(
			'https://cloud.jetpack.com/fr/pricing/'
		);
		expect( localizeUrl( 'https://cloud.jetpack.com/pricing/', 'pt-br' ) ).toEqual(
			'https://cloud.jetpack.com/pt-br/pricing/'
		);
		expect( localizeUrl( 'https://cloud.jetpack.com/pricing/', 'zh-tw' ) ).toEqual(
			'https://cloud.jetpack.com/zh-tw/pricing/'
		);
		expect( localizeUrl( 'https://cloud.jetpack.com/pricing/', 'xx' ) ).toEqual(
			'https://cloud.jetpack.com/pricing/'
		);
	} );

	test( 'Jetpack Manage', () => {
		expect( localizeUrl( 'https://cloud.jetpack.com/manage/pricing/', 'en' ) ).toEqual(
			'https://cloud.jetpack.com/manage/pricing/'
		);
		expect( localizeUrl( 'https://cloud.jetpack.com/manage/pricing/', 'fr' ) ).toEqual(
			'https://cloud.jetpack.com/fr/manage/pricing/'
		);
		expect( localizeUrl( 'https://cloud.jetpack.com/manage/pricing/', 'pt-br' ) ).toEqual(
			'https://cloud.jetpack.com/pt-br/manage/pricing/'
		);
		expect( localizeUrl( 'https://cloud.jetpack.com/manage/pricing/', 'zh-tw' ) ).toEqual(
			'https://cloud.jetpack.com/zh-tw/manage/pricing/'
		);
		expect( localizeUrl( 'https://cloud.jetpack.com/manage/pricing/', 'xx' ) ).toEqual(
			'https://cloud.jetpack.com/manage/pricing/'
		);
	} );

	test( 'WordPress.com URLs', () => {
		expect( localizeUrl( 'https://wordpress.com/wp-login.php?action=lostpassword', 'en' ) ).toEqual(
			'https://wordpress.com/wp-login.php?action=lostpassword'
		);
		expect( localizeUrl( 'https://wordpress.com/wp-login.php?action=lostpassword', 'de' ) ).toEqual(
			'https://de.wordpress.com/wp-login.php?action=lostpassword'
		);
	} );

	test( 'WordPress.com plans URLs', () => {
		expect( localizeUrl( 'https://wordpress.com/plans/', 'en', false ) ).toEqual(
			'https://wordpress.com/plans/'
		);
		expect( localizeUrl( 'https://wordpress.com/plans/', 'en', true ) ).toEqual(
			'https://wordpress.com/plans/'
		);
		expect( localizeUrl( 'https://wordpress.com/plans/', 'es', false ) ).toEqual(
			'https://wordpress.com/es/plans/'
		);
		expect( localizeUrl( 'https://wordpress.com/plans/', 'es', true ) ).toEqual(
			'https://wordpress.com/plans/'
		);

		// Greek
		expect( localizeUrl( 'https://wordpress.com/plans/', 'el', false ) ).toEqual(
			'https://wordpress.com/el/plans/'
		);
		expect( localizeUrl( 'https://wordpress.com/plans/', 'el', true ) ).toEqual(
			'https://wordpress.com/plans/'
		);

		// Romanian
		expect( localizeUrl( 'https://wordpress.com/plans/', 'ro', false ) ).toEqual(
			'https://wordpress.com/ro/plans/'
		);
		expect( localizeUrl( 'https://wordpress.com/plans/', 'ro', true ) ).toEqual(
			'https://wordpress.com/plans/'
		);

		// Non Mag-16, Finnish
		expect( localizeUrl( 'https://wordpress.com/plans/', 'fi', false ) ).toEqual(
			'https://wordpress.com/plans/'
		);
		expect( localizeUrl( 'https://wordpress.com/plans/', 'fi', true ) ).toEqual(
			'https://wordpress.com/plans/'
		);

		// Full path to a site plan
		expect(
			localizeUrl( 'https://wordpress.com/plans/example.wordpress.com', 'en', false )
		).toEqual( 'https://wordpress.com/plans/example.wordpress.com/' );

		expect(
			localizeUrl( 'https://wordpress.com/plans/example.wordpress.com', 'en', true )
		).toEqual( 'https://wordpress.com/plans/example.wordpress.com/' );

		expect(
			localizeUrl( 'https://wordpress.com/plans/example.wordpress.com', 'es', false )
		).toEqual( 'https://wordpress.com/plans/example.wordpress.com/' );

		expect(
			localizeUrl( 'https://wordpress.com/plans/example.wordpress.com', 'es', true )
		).toEqual( 'https://wordpress.com/plans/example.wordpress.com/' );
	} );

	test( 'WordPress.com new style support URLs', () => {
		expect( localizeUrl( 'https://wordpress.com/support/reader/', 'de' ) ).toEqual(
			'https://wordpress.com/de/support/reader/'
		);
		expect( localizeUrl( 'https://wordpress.com/support/reader/#blocking-sites', 'de' ) ).toEqual(
			'https://wordpress.com/de/support/reader/#blocking-sites'
		);
	} );

	test( 'Contact Support', () => {
		// Assumes logged-in, these URLs should not be modified.
		expect( localizeUrl( 'https://wordpress.com/help/contact', 'en' ) ).toEqual(
			'https://wordpress.com/help/contact/'
		);
		expect( localizeUrl( 'https://wordpress.com/help/contact', 'de' ) ).toEqual(
			'https://wordpress.com/help/contact/'
		);
		// When logged-out, use localized URLs.
		expect( localizeUrl( 'https://wordpress.com/help/contact', 'en', false ) ).toEqual(
			'https://wordpress.com/support/contact/'
		);
		expect( localizeUrl( 'https://wordpress.com/help/contact', 'de', false ) ).toEqual(
			'https://wordpress.com/de/support/contact/'
		);
		// pl is not a supportSiteLocale:
		expect( localizeUrl( 'https://wordpress.com/help/contact', 'pl', false ) ).toEqual(
			'https://wordpress.com/support/contact/'
		);
	} );

	test( 'apps', () => {
		expect( localizeUrl( 'https://apps.wordpress.com', 'de' ) ).toEqual(
			'https://apps.wordpress.com/de/'
		);
		expect( localizeUrl( 'https://apps.wordpress.com', 'es' ) ).toEqual(
			'https://apps.wordpress.com/es/'
		);
		expect( localizeUrl( 'https://apps.wordpress.com/support/desktop/', 'de' ) ).toEqual(
			'https://apps.wordpress.com/de/support/desktop/'
		);
		expect( localizeUrl( 'https://apps.wordpress.com/support/desktop/', 'es' ) ).toEqual(
			'https://apps.wordpress.com/es/support/desktop/'
		);
		expect( localizeUrl( 'https://apps.wordpress.com/d/osx/?ref=getapps', 'de' ) ).toEqual(
			'https://apps.wordpress.com/de/d/osx/?ref=getapps'
		);
		expect( localizeUrl( 'https://apps.wordpress.com/d/osx/?ref=getapps', 'es' ) ).toEqual(
			'https://apps.wordpress.com/es/d/osx/?ref=getapps'
		);
		expect( localizeUrl( 'https://apps.wordpress.com', 'en' ) ).toEqual(
			'https://apps.wordpress.com/'
		);
		expect( localizeUrl( 'https://apps.wordpress.com/support/desktop/', 'en' ) ).toEqual(
			'https://apps.wordpress.com/support/desktop/'
		);
	} );
} );
