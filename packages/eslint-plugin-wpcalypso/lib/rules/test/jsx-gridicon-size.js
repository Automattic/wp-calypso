/**
 * @file Enforce recommended Gridicon size attributes
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const RuleTester = require( 'eslint' ).RuleTester;
const plugin = require( '../../..' );
const { ERROR_MESSAGE } = require( '../../../lib/rules/jsx-gridicon-size' );

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

new RuleTester( {
	languageOptions: {
		parserOptions: { ecmaFeatures: { jsx: true } },
	},
} ).run( 'jsx-gridicon-size', plugin.rules[ 'jsx-gridicon-size' ], {
	valid: [
		{
			code: '<Gridicon size={ 18 } />',
		},
	],

	invalid: [
		{
			code: '<Gridicon size={ 20 } />',
			errors: [
				{
					message: ERROR_MESSAGE,
				},
			],
		},
	],
} );
