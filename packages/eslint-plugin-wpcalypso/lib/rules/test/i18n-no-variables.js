/**
 * @file Disallow variables as translate strings
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require( '../../../lib/rules/i18n-no-variables' );
const config = { env: { es6: true } }; // support for string templates
const RuleTester = require( 'eslint' ).RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

new RuleTester( config ).run( 'i18n-no-variables', rule, {
	valid: [
		{
			code: "translate( 'Hello World' );",
		},
		{
			code: "translate( 'Hello' + ' World' );",
		},
		{
			code: "translate( 'Hello World', {} );",
		},
		{
			code: 'translate( \'Hello World\', { context: "a literal" } );',
		},
		{
			code: "translate( 'A literal key', { 'context': \"A literal\" } );",
		},
		{
			code: "translate( { original: 'Hello World' } );",
		},
		{
			code: "translate( { original: { single: 'Hello World' } } );",
		},
		{
			code: 'translate( `Hello World` );',
		},
	],

	invalid: [
		{
			code: 'translate( string );',
			errors: [
				{
					message: rule.ERROR_MESSAGE,
				},
			],
		},
		{
			code: "translate( 'Hello World', plural, {} );",
			errors: [
				{
					message: rule.ERROR_MESSAGE,
				},
			],
		},
		{
			code: "translate( 'Hello World', { context: aVariable } );",
			errors: [
				{
					message: rule.ERROR_MESSAGE,
				},
			],
		},
		{
			code: "translate( 'Hello World', { context: aFunctionCall() } );",
			errors: [
				{
					message: rule.ERROR_MESSAGE,
				},
			],
		},
		{
			code: "translate( 'Hello World', { comment: aVariable } );",
			errors: [
				{
					message: rule.ERROR_MESSAGE,
				},
			],
		},
		{
			code: "translate( 'Hello ' + name );",
			errors: [
				{
					message: rule.ERROR_MESSAGE,
				},
			],
		},
		{
			code: 'translate( { original: string } );',
			errors: [
				{
					message: rule.ERROR_MESSAGE,
				},
			],
		},
		{
			code: 'translate( { original: { single: string } } );',
			errors: [
				{
					message: rule.ERROR_MESSAGE,
				},
			],
		},
		{
			code: '/*eslint-env es6*/ translate( `Hello ${World}!` );',
			errors: [
				{
					message: rule.ERROR_MESSAGE,
				},
			],
		},
	],
} );
