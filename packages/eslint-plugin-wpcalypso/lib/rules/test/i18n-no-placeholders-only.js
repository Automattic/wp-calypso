/**
 * @file Disallow strings which include only placeholders
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const RuleTester = require( 'eslint' ).RuleTester;
const plugin = require( '../../..' );
const { ERROR_MESSAGE } = require( '../../../lib/rules/i18n-no-placeholders-only' );
const config = { languageOptions: { ecmaVersion: 2015, sourceType: 'script' } }; // support for string templates

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

new RuleTester( config ).run(
	'i18n-no-placeholders-only',
	plugin.rules[ 'i18n-no-placeholders-only' ],
	{
		valid: [
			{
				code: "translate( 'Hello %s' );",
			},
			{
				code: "translate( 'Hello %(toWhom)s' );",
			},
			{
				code: 'translate( `Hello %(toWhom)s` );',
			},
			{
				code: "translate( '%s%%s' );",
			},
			{
				code: "translate( '{{example}}Hello World{{/example}}' );",
			},
		],

		invalid: [
			{
				code: "translate( '%s%d' );",
				errors: [
					{
						message: ERROR_MESSAGE,
					},
				],
			},
			{
				code: 'translate( `%s%d` );',
				errors: [
					{
						message: ERROR_MESSAGE,
					},
				],
			},
			{
				code: "translate( 'Hello World', '%s%d' );",
				errors: [
					{
						message: ERROR_MESSAGE,
					},
				],
			},
			{
				code: "translate( '{{example}}%s{{/example}}' );",
				errors: [
					{
						message: ERROR_MESSAGE,
					},
				],
			},
		],
	}
);
