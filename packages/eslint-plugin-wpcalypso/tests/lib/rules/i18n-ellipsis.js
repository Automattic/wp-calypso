/**
 * @fileoverview Disallow using three dots in translate strings
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require( '../../../lib/rules/i18n-ellipsis' ),
	RuleTester = require( 'eslint' ).RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

( new RuleTester() ).run( 'i18n-ellipsis', rule, {
	valid: [
		{
			code: 'this.translate( \'Hello World…\' );'
		},
		{
			code: 'i18n.translate( \'Hello World…\' );'
		},
		{
			code: 'translate( \'Hello World…\' );'
		},
		{
			code: 'translate( \'Hello World…\', \'Hello Worlds…\' );'
		},
		{
			code: '( 0, translate )( \'Hello World…\' );'
		}
	],

	invalid: [
		{
			code: 'this.translate( \'Hello World...\' );',
			errors: [ {
				message: rule.ERROR_MESSAGE
			} ]
		},
		{
			code: 'i18n.translate( \'Hello World...\' );',
			errors: [ {
				message: rule.ERROR_MESSAGE
			} ]
		},
		{
			code: 'translate( \'Hello World...\' );',
			errors: [ {
				message: rule.ERROR_MESSAGE
			} ]
		},
		{
			code: 'translate( \'Hello World…\', \'Hello Worlds...\' );',
			errors: [ {
				message: rule.ERROR_MESSAGE
			} ]
		},
		{
			code: '( 0, translate )( \'Hello World...\' );',
			errors: [ {
				message: rule.ERROR_MESSAGE
			} ]
		}
	]
} );
