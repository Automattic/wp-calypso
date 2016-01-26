/**
 * @fileoverview Disallow importing from the root Lodash module
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require( '../../../lib/rules/no-lodash-import' ),
	RuleTester = require( 'eslint' ).RuleTester;

require( 'babel-eslint' );

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

( new RuleTester() ).run( 'no-lodash-import', rule, {
	valid: [
		{
			code: 'import eslint from \'eslint\';',
			parser: 'babel-eslint'
		},
		{
			code: 'import mapKeys from \'lodash/mapKeys\';',
			parser: 'babel-eslint'
		},
		{
			code: 'var eslint = require( \'eslint\' );',
			parser: 'babel-eslint'
		},
		{
			code: 'var mapKeys = require( \'lodash/mapKeys\' );',
			parser: 'babel-eslint'
		}
	],

	invalid: [
		{
			code: 'import { mapKeys } from \'lodash\';',
			errors: [ {
				message: 'Never import from root Lodash package'
			} ],
			parser: 'babel-eslint'
		},
		{
			code: 'var mapKeys = require( \'lodash\' ).mapKeys;',
			errors: [ {
				message: 'Never import from root Lodash package'
			} ],
			parser: 'babel-eslint'
		}
	]
} );
