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

var rule = require( '../../../lib/rules/i18n-no-newlines' ),
	config = { env: { es6: true } },  // support for string templates
	RuleTester = require( 'eslint' ).RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

( new RuleTester( config ) ).run( 'i18n-no-newlines', rule, {
	valid: [
		{
			code: 'this.translate( \'Hello World…\' );'
		},
		{
			code: 'i18n.translate( \'Hello World…\' );'
		},
		{
			code: "translate( 'Hello World!' ) + '<br>' + translate( 'More text on another line' );"
		},
		{
			code: "translate( '<p>Hello' + ' World!</p>' );"
		},
	],

	invalid: [
		{
			code: 'translate( "My double-quoted string\\nwith a newline" );',
			errors: [ {
				message: rule.ERROR_MESSAGE
			} ]
		},
		{
			code: "translate( 'My single quoted string\\nwith a newline' );",
			errors: [ {
				message: rule.ERROR_MESSAGE
			} ]
		},
		{
			code: 'translate( `My template literal\non two lines` );',
			errors: [ {
				message: rule.ERROR_MESSAGE
			} ]
		},
	]
} );
