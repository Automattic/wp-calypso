/**
 * @file Enforce external, internal, WordPress dependencies docblocks
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require( '../../../lib/rules/import-docblock' );
const RuleTester = require( 'eslint' ).RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

new RuleTester( {
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
	},
} ).run( 'import-docblock', rule, {
	valid: [
		{
			code: `/**
 * External dependencies
 */
import eslint from 'eslint';`,
		},
		{
			code: `/**
 * External dependencies
 */
import eslint from 'eslint';`,
		},
		{
			code: `/**
 * External dependencies${ ' ' }
 */
import eslint from 'eslint';`,
		},
	],

	invalid: [
		{
			code: "import eslint from 'eslint';",
			errors: [
				{
					message: 'Missing external, internal, WordPress dependencies docblocks',
				},
			],
		},
	],
} );
