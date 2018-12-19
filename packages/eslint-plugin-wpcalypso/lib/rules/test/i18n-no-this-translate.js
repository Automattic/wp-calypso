/** @format */
/**
 * @fileoverview Disallow the use of this.translate
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require( '../../../lib/rules/i18n-no-this-translate' ),
	RuleTester = require( 'eslint' ).RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

new RuleTester().run( 'i18n-no-this-translate', rule, {
	valid: [ "i18n.translate('hello')", "translate('hello')", "this.props.translate('hello')" ],

	invalid: [
		{
			code: "this.translate('hello')",
			errors: [
				{
					message:
						'Use localize( ReactComponent ) instead of this.translate. See https://git.io/vSwRi',
				},
			],
		},
	],
} );
