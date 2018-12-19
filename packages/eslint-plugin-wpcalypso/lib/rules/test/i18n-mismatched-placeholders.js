/** @format */
/**
 * @fileoverview Ensure placeholder counts match between singular and plural strings
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require( '../../../lib/rules/i18n-mismatched-placeholders' ),
	config = { env: { es6: true } }, // support for string templates
	RuleTester = require( 'eslint' ).RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

new RuleTester( config ).run( 'i18n-mismatched-placeholders', rule, {
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
					message: rule.ERROR_MESSAGE,
				},
			],
		},
		{
			code: "translate( '%s thing', 'Many things', { count: 2 } );",
			errors: [
				{
					message: rule.ERROR_MESSAGE,
				},
			],
		},
		{
			code: "translate( '%s%s', '%s', { count: 2 } );",
			errors: [
				{
					message: rule.ERROR_MESSAGE,
				},
			],
		},
		{
			code: 'translate( `%s%s`, `%s`, { count: 2 } );',
			errors: [
				{
					message: rule.ERROR_MESSAGE,
				},
			],
		},
	],
} );
