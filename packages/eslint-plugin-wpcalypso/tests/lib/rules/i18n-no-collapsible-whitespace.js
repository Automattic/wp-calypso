/**
 * @fileoverview Disallow collapsible whitespace in translatable strings
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */
'use strict';

var NO_NEWLINES, NO_CONSECUTIVE_SPACES, NO_TABS;

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require( '../../../lib/rules/i18n-no-collapsible-whitespace' ),
	config = { env: { es6: true } }, // support for string templates
	formatMessage = require( '../../util/format-message' ),
	RuleTester = require( 'eslint' ).RuleTester;

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

NO_NEWLINES = formatMessage( rule.ERROR_MESSAGE, { problem: ' (\\n)' } );
NO_CONSECUTIVE_SPACES = formatMessage( rule.ERROR_MESSAGE, { problem: ' (consecutive spaces)' } );
NO_TABS = formatMessage( rule.ERROR_MESSAGE, { problem: ' (\\t)' } );

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

( new RuleTester( config ) ).run( 'i18n-no-collapsible-whitespace', rule, {
	valid: [
		{
			code: 'this.translate( \'Hello World…\' );',
		},
		{
			code: 'i18n.translate( \'Hello World…\' );',
		},
		{
			code: "translate( 'Hello World!' ) + '<br>' + translate( 'More text on another line' );",
		},
		{
			code: "translate( '<p>Hello' + ' World!</p>' );",
		},
		{
			code: 'translate( `A long string ` +\n `spread over ` +\n  `multiple lines.` );',
		},

	],

	invalid: [
		{
			code: 'translate( "My double-quoted string\\nwith a newline" );',
			errors: [ {
				message: NO_NEWLINES,
				problem: ' (\\n)',
			} ],
		},
		{
			code: "translate( 'My single quoted string\\nwith a newline' );",
			errors: [ {
				message: NO_NEWLINES,
			} ],
		},
		{
			code: 'translate( `My template literal\non two lines` );',
			errors: [ {
				message: NO_NEWLINES,
			} ],
		},
		{
			code: "translate( '	My tab-indented string.' );",
			errors: [ {
				message: NO_TABS,
			} ],
		},
		{
			code: "translate( '\tMy string with a tab escape sequence.' );",
			errors: [ {
				message: NO_TABS,
			} ],
		},
		{
			code: "translate( '\u0009My string with a unicode tab.' );",
			errors: [ {
				message: NO_TABS,
			} ],
		},
		{
			code: 'translate( `A string with \r a carriage return.` );',
			errors: [ {
				message: NO_NEWLINES,
			} ],
		},
		{
			code: "translate( 'A string with consecutive spaces.  These two are after a full stop.' );",
			errors: [ {
				message: NO_CONSECUTIVE_SPACES,
			} ],
		},
	],
} );
