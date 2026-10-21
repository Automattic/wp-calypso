/**
 * @file Disallow using the wildcard `*` in postMessage
 * @author Automattic
 * @copyright 2017 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const RuleTester = require( 'eslint' ).RuleTester;
const plugin = require( '../../..' );
const { ERROR_MESSAGE } = require( '../../../lib/rules/post-message-no-wildcard-targets' );
const config = { languageOptions: { ecmaVersion: 2015, sourceType: 'script' } };

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

new RuleTester( config ).run(
	'post-message-no-wildcard-targets',
	plugin.rules[ 'post-message-no-wildcard-targets' ],
	{
		valid: [
			{ code: 'foo()' },
			{ code: "foo( 1, '*' )" },
			{ code: "postMessage( 1, 'test' )" },
			{ code: 'postMessage( null, test )' },
			{ code: 'postMessage( true, test() )' },
			{ code: "postMessage( '*', 'some.domain' )" },
		],

		invalid: [
			{
				code: "postMessage( 'bob', '*' )",
				errors: [ { message: ERROR_MESSAGE } ],
			},
			{
				code: "postMessage( false, '*' )",
				errors: [ { message: ERROR_MESSAGE } ],
			},
			{
				code: 'postMessage( JSON.stringify( {} ), "*" )',
				errors: [ { message: ERROR_MESSAGE } ],
			},
			{
				code: 'postMessage( null, `*` )',
				errors: [ { message: ERROR_MESSAGE } ],
			},
			{
				code: "window.postMessage( null, '*' )",
				errors: [ { message: ERROR_MESSAGE } ],
			},
			{
				code: "frame.postMessage( null, '*' )",
				errors: [ { message: ERROR_MESSAGE } ],
			},
			{
				code: "a.contentWindow.postMessage( null, '*' )",
				errors: [ { message: ERROR_MESSAGE } ],
			},
		],
	}
);
