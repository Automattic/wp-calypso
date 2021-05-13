/**
 * @file Disallow multiple unnamed placeholders
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require( '../../../lib/rules/i18n-named-placeholders' );
const config = { env: { es6: true } }; // support for string templates
const RuleTester = require( 'eslint' ).RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

new RuleTester( config ).run( 'i18n-named-placeholders', rule, {
	valid: [
		{
			code: 'translate( /* zero args */ );',
		},
		{
			code: "translate( 'Hello %s' );",
		},
		{
			code: "translate( '%1s %2s' );",
		},
		{
			code: 'translate( `%1s %2s` );',
		},
		{
			code: "translate( '%(greeting)s %(toWhom)s' );",
		},
		{
			code: "this.translate( '%(percent)d%% of views', { args: { percent: 40 } } );",
		},
	],

	invalid: [
		{
			code: "translate( '%s %s' );",
			errors: [
				{
					message: rule.ERROR_MESSAGE,
				},
			],
		},
		{
			code: 'translate( `%s %s` );',
			errors: [
				{
					message: rule.ERROR_MESSAGE,
				},
			],
		},
		{
			code: "translate( '%(greeting)s %s' );",
			errors: [
				{
					message: rule.ERROR_MESSAGE,
				},
			],
		},
		{
			code: "translate( 'Hello %s', '%s %s', { count: 2 } );",
			errors: [
				{
					message: rule.ERROR_MESSAGE,
				},
			],
		},
	],
} );
