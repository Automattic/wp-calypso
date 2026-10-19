/**
 * @file Disallow variables as translate strings
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const RuleTester = require( 'eslint' ).RuleTester;
const plugin = require( '../../..' );
const { ERROR_MESSAGE } = require( '../../../lib/rules/i18n-no-variables' );
const config = { languageOptions: { ecmaVersion: 2015, sourceType: 'script' } }; // support for string templates

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

new RuleTester( config ).run( 'i18n-no-variables', plugin.rules[ 'i18n-no-variables' ], {
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
					message: ERROR_MESSAGE,
				},
			],
		},
		{
			code: "translate( 'Hello World', plural, {} );",
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
		},
		{
			code: "translate( 'Hello World', { context: aVariable } );",
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
		},
		{
			code: "translate( 'Hello World', { context: aFunctionCall() } );",
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
		},
		{
			code: "translate( 'Hello World', { comment: aVariable } );",
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
		},
		{
			code: "translate( 'Hello World', { comment: 'A literal', context: aVariable } );",
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
		},
		{
			code: "translate( { original: { single: 'Hello World', plural: string } } );",
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
		},
		{
			code: "translate( 'Hello ' + name );",
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
		},
		{
			code: 'translate( { original: string } );',
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
		},
		{
			code: 'translate( { original: { single: string } } );',
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
		},
		{
			code: 'translate( `Hello ${World}!` );',
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
		},
	],
} );
