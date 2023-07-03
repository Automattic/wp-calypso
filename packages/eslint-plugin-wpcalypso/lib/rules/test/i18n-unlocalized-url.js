/**
 * @file Disallow using unlocalized URL strings
 * @author Automattic
 * @copyright 2023 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const RuleTester = require( 'eslint' ).RuleTester;
const rule = require( '../i18n-unlocalized-url' );

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const localizableUrls = [
	'https://apps.wordpress.com',
	'https://apps.wordpress.com/mobile',
	'https://automattic.com/cookies',
	'https://automattic.com/privacy',
	'https://wordpress.com/tos',
	'https://wordpress.com/blog',
	'https://wordpress.com/forums',
	'https://wordpress.com/go',
	'https://wordpress.com/go/some-page',
	'https://wordpress.com/support',
	'https://wordpress.com/support/some-article',
].reduce( ( urls, url ) => {
	// For each individual localizable URL, add the original URL and variants with trailing slash, hash and query string.
	return urls.concat( [
		url,
		`${ url }/`,
		`${ url }#hash`,
		`${ url }/#hash`,
		`${ url }?query-string`,
		`${ url }/?query-string`,
	] );
}, [] );

const nonLocalizableUrls = [
	'https://example.com',
	'https://automattic.com/cookies/some-page/',
	'https://automattic.com/privacy/some-page/',
	'https://wordpress.com/tos/some-page/',
	'https://wordpress.com/blog/some-post/',
	'https://wordpress.com/forums/some-thread',
];

new RuleTester( {
	parserOptions: {
		sourceType: 'module',
		ecmaFeatures: { jsx: true },
		ecmaVersion: 6,
	},
} ).run( 'i18n-unlocalized-url', rule, {
	valid: [].concat(
		localizableUrls.reduce( ( cases, url ) => {
			return cases.concat( [
				`const url = localizeUrl( '${ url }' )`,
				`const url = '${ url }'; localizeUrl( url );`,
				`const link = <a href={ localizeUrl( '${ url }' ) }></a>;`,
				`const url = '${ url }'; const link = <a href={ localizeUrl( url ) }></a>;`,
				`const url = localizeUrl( \`${ url }?param=test\` );`,
				`const url = localizeUrl( true ? '${ url }' : 'https://example.com' );`,
				`const url = true ? '${ url }' : 'https://example.com'; localizeUrl( url );`,
				`const url = localizeUrl( false || \`${ url }\` );`,
				`const url = false || \`${ url }\`; localizeUrl( url );`,
			] );
		}, [] ),
		nonLocalizableUrls.reduce( ( cases, url ) => {
			return cases.concat( [
				`const url = '${ url }'`,
				`const link = <a href={ '${ url }' }></a>;`,
			] );
		}, [] )
	),

	invalid: localizableUrls.reduce( ( cases, url ) => {
		return cases.concat( [
			{
				code: `const url = '${ url }'`,
				errors: [ { message: rule.ERROR_MESSAGE } ],
			},
			{
				code: `const link = <a href={ '${ url }' }></a>;`,
				errors: [ { message: rule.ERROR_MESSAGE } ],
			},
			{
				code: `isLink ? '${ url }' : ''`,
				errors: [ { message: rule.ERROR_MESSAGE } ],
			},
		] );
	}, [] ),
} );
