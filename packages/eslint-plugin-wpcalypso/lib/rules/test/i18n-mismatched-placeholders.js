/**
 * @file Ensure placeholder counts match between singular and plural strings
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const RuleTester = require( 'eslint' ).RuleTester;
const plugin = require( '../../..' );
const { ERROR_MESSAGE } = require( '../../../lib/rules/i18n-mismatched-placeholders' );
const config = { languageOptions: { ecmaVersion: 2015, sourceType: 'script' } }; // support for string templates

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

new RuleTester( config ).run(
	'i18n-mismatched-placeholders',
	plugin.rules[ 'i18n-mismatched-placeholders' ],
	{
		valid: [
			{
				code: "translate( 'Hello %s' );",
			},
			{
				code: "translate( 'Hello %s', 'Hello %s' );",
			},
		],

		invalid: [
			{
				code: "translate( 'One thing', '%s things', { count: 2 } );",
				errors: [
					{
						message: ERROR_MESSAGE,
					},
				],
			},
			{
				code: "translate( '%s thing', 'Many things', { count: 2 } );",
				errors: [
					{
						message: ERROR_MESSAGE,
					},
				],
			},
			{
				code: "translate( '%s%s', '%s', { count: 2 } );",
				errors: [
					{
						message: ERROR_MESSAGE,
					},
				],
			},
			{
				code: 'translate( `%s%s`, `%s`, { count: 2 } );',
				errors: [
					{
						message: ERROR_MESSAGE,
					},
				],
			},
		],
	}
);
