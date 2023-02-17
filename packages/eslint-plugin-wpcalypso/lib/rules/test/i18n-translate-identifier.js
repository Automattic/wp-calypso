/**
 * @file Disallow declaring variables with unexpected identifier names referring to translation functions.
 * @author Automattic
 * @copyright 2023 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const RuleTester = require( 'eslint' ).RuleTester;
const rule = require( '../i18n-translate-identifier' );

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

new RuleTester( {
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 6,
	},
} ).run( 'i18n-translate-identifier', rule, {
	valid: [
		'var translate = useTranslate();',
		'const translate = useTranslate();',
		'let translate = useTranslate();',
		'useTranslate();',
		'const { __ } = useI18n();',
		'const { _n } = useI18n();',
		'const { __, _n, _nx, _x } = useI18n();',
		'const { isRTL } = useI18n();',
		'useI18n();',
	],

	invalid: [
		{
			code: 'const __ = useTranslate();',
			errors: [
				{
					message:
						'Variable identifier should be named `translate` in order to be properly detected by the string extraction tools',
				},
			],
		},
		{
			code: 'const { __: translate } = useI18n();',
			errors: [
				{
					message:
						'Variable identifier should be named `__` in order to be properly detected by the string extraction tools',
				},
			],
		},
		{
			code: 'const { _nx: _n } = useI18n();',
			errors: [
				{
					message:
						'Variable identifier should be named `_nx` in order to be properly detected by the string extraction tools',
				},
			],
		},
		{
			code: 'const { __, _n: translate } = useI18n();',
			errors: [
				{
					message:
						'Variable identifier should be named `_n` in order to be properly detected by the string extraction tools',
				},
			],
		},
		{
			code: 'const { __: a, _n: b, _nx: c, _x: d } = useI18n();',
			errors: [
				{
					message:
						'Variable identifier should be named `__` in order to be properly detected by the string extraction tools',
				},
				{
					message:
						'Variable identifier should be named `_n` in order to be properly detected by the string extraction tools',
				},
				{
					message:
						'Variable identifier should be named `_nx` in order to be properly detected by the string extraction tools',
				},
				{
					message:
						'Variable identifier should be named `_x` in order to be properly detected by the string extraction tools',
				},
			],
		},
	],
} );
