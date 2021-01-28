/* eslint-disable no-shadow -- shadowing localizeUrl makes tests readable */

/**
 * External dependencies
 */
import { renderHook } from '@testing-library/react-hooks';

/**
 * Internal dependencies
 */
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
		expect( localizeUrl( 'https://automattic.com/cookies/', 'de' ) ).toEqual(
			'https://automattic.com/de/cookies/'
		);
		expect( localizeUrl( 'https://automattic.com/cookies', 'de' ) ).toEqual(
			'https://automattic.com/de/cookies/'
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

	test( 'jetpack', () => {
		expect( localizeUrl( 'https://jetpack.com/features/comparison/', 'en' ) ).toEqual(
			'https://jetpack.com/features/comparison/'
		);
		expect( localizeUrl( 'https://jetpack.com/features/comparison/', 'de' ) ).toEqual(
			'https://de.jetpack.com/features/comparison/'
		);
		expect( localizeUrl( 'https://jetpack.com/features/comparison/', 'pt-br' ) ).toEqual(
			'https://br.jetpack.com/features/comparison/'
		);
		expect( localizeUrl( 'https://jetpack.com/features/comparison/', 'zh-tw' ) ).toEqual(
			'https://zh-tw.jetpack.com/features/comparison/'
		);
		expect( localizeUrl( 'https://jetpack.com/features/comparison/', 'pl' ) ).toEqual(
			'https://jetpack.com/features/comparison/'
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
} );
