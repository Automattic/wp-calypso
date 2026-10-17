/**
 * @file Disallow using three dots in translate strings
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const RuleTester = require( 'eslint' ).RuleTester;
const plugin = require( '../../..' );
const { ERROR_MESSAGE } = require( '../../../lib/rules/i18n-ellipsis' );
const config = { languageOptions: { ecmaVersion: 2015, sourceType: 'script' } }; // support for string templates

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

new RuleTester( config ).run( 'i18n-ellipsis', plugin.rules[ 'i18n-ellipsis' ], {
	valid: [
		{
			code: "translate( 'Hello World…' );",
		},
		{
			code: "i18n.translate( 'Hello World…' );",
		},
		{
			code: "this.translate( 'Hello World…' );",
		},
		{
			code: 'translate( "Hello World…" );',
		},
		{
			code: 'translate( `Hello World…` );',
		},
		{
			code: 'translate( `Hello ${ World }…` );',
		},
		{
			code: "translate( 'Hello World…', 'Hello Worlds…' );",
		},
		{
			code: "( 0, translate )( 'Hello World…' );",
		},
		{ code: "__( '…' );" },
		{ code: "__( '…', 'dots-in-locale-fine...' );" },
		{ code: "_x( '…', 'Dots in the context are fine...' );" },
		{ code: "_n( '…', '…s', 1 );" },
		{ code: "_nx( '…', '…s', 2, 'ellipses' );" },
	],

	invalid: [
		{
			code: "translate( 'Hello World...' );",
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
			output: "translate( 'Hello World…' );",
		},
		{
			code: "i18n.translate( 'Hello World...' );",
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
			output: "i18n.translate( 'Hello World…' );",
		},
		{
			code: "this.translate( 'Hello World...' );",
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
			output: "this.translate( 'Hello World…' );",
		},
		{
			code: 'translate( "Hello World..." );',
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
			output: 'translate( "Hello World…" );',
		},
		{
			code: "translate( 'Fix... ' + 'Joined strings...' );",
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
			output: "translate( 'Fix… ' + 'Joined strings…' );",
		},
		{
			code: "translate( 'Fix ...' + `Joined template` );",
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
			output: "translate( 'Fix …' + `Joined template` );",
		},
		{
			code: "translate( 'Fix ...' + 'Multiple ... ' + 'Joined ...' );",
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
			output: "translate( 'Fix …' + 'Multiple … ' + 'Joined …' );",
		},
		{
			code: 'translate( `Hello World...` );',
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
			output: 'translate( `Hello World…` );',
		},
		{
			code: 'translate( `Hello ${ "World" }...` );',
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
			output: 'translate( `Hello ${ "World" }…` );',
		},
		{
			code: 'translate( `Hello ${ world }...` );',
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
			output: 'translate( `Hello ${ world }…` );',
		},
		{
			code: "translate( 'Hello World…', 'Hello Worlds...' );",
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
			output: "translate( 'Hello World…', 'Hello Worlds…' );",
		},
		{
			code: "( 0, translate )( 'Hello World...' );",
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
			output: "( 0, translate )( 'Hello World…' );",
		},
		{
			code: "__( '...' );",
			errors: [ { message: ERROR_MESSAGE } ],
			output: "__( '…' );",
		},
		{
			code: '__( `Template ${ aString }...` );',
			errors: [ { message: ERROR_MESSAGE } ],
			output: '__( `Template ${ aString }…` );',
		},
		{
			code: "_x( '...', 'ellipsis' );",
			errors: [ { message: ERROR_MESSAGE } ],
			output: "_x( '…', 'ellipsis' );",
		},
		{
			code: "_n( '...', '...s', 1 );",
			errors: [ { message: ERROR_MESSAGE }, { message: ERROR_MESSAGE } ],
			output: "_n( '…', '…s', 1 );",
		},
		{
			code: "_nx( '...', '...s', 2, 'ellipses' );",
			errors: [ { message: ERROR_MESSAGE }, { message: ERROR_MESSAGE } ],
			output: "_nx( '…', '…s', 2, 'ellipses' );",
		},
	],
} );
