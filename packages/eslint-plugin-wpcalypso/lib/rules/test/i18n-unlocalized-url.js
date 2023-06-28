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
	'https://apps.wordpress.com/',
	'https://automattic.com/cookies/',
	'https://automattic.com/privacy/',
	'https://wordpress.com/support/test-article/',
	'https://wordpress.com/forums/',
	'https://wordpress.com/tos/',
];

const nonLocalizableUrls = [ 'https://example.com', 'https://wordpress.com/forums/some-thread' ];

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
		] );
	}, [] ),
} );
