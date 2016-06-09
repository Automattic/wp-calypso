/**
 * @fileoverview Enforce recommended Gridicon size attributes
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require( '../../../lib/rules/jsx-gridicon-size' ),
	RuleTester = require( 'eslint' ).RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

( new RuleTester() ).run( 'jsx-gridicon-size', rule, {
	valid: [
		{
			code: '<Gridicon size={ 18 } />',
			ecmaFeatures: { jsx: true }
		}
	],

	invalid: [
		{
			code: '<Gridicon size={ 20 } />',
			ecmaFeatures: { jsx: true },
			errors: [ {
				message: rule.ERROR_MESSAGE
			} ]
		}
	]
} );
