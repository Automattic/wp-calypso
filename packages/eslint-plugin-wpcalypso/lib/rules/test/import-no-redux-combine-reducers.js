/** @format */
/**
 * @fileoverview Disallow combineReducers import from redux
 * @author Automattic
 * @copyright 2017 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require( '../../../lib/rules/import-no-redux-combine-reducers' ),
	RuleTester = require( 'eslint' ).RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

new RuleTester( {
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
	},
} ).run( 'import-no-redux-combine-reducers', rule, {
	valid: [
		{
			code: "import { combineReducers } from 'state/utils';",
		},
		{
			code: "import { combineReducers as bar } from 'state/utils';",
		},
		{
			code: "import { createStore } from 'redux';",
		},
	],

	invalid: [
		{
			code: "import { combineReducers } from 'redux';",
			errors: [
				{
					message: 'combineReducers should be imported from state/utils not redux',
				},
			],
		},
		{
			code: "import { createStore, combineReducers } from 'redux';",
			errors: [
				{
					message: 'combineReducers should be imported from state/utils not redux',
				},
			],
		},
		{
			code: "import { createStore, combineReducers as bar } from 'redux';",
			errors: [
				{
					message: 'combineReducers should be imported from state/utils not redux',
				},
			],
		},
	],
} );
