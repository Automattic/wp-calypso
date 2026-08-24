/**
 * @file Ensure conditionally rendered i18n text nodes with siblings are flagged.
 * @author Automattic
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const RuleTester = require( 'eslint' ).RuleTester;
const rule = require( '../../../lib/rules/no-conditional-text-nodes-with-siblings' );

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

new RuleTester( {
	parser: require.resolve( '@babel/eslint-parser' ),
	parserOptions: {
		requireConfigFile: false,
		ecmaFeatures: { jsx: true },
		babelOptions: { presets: [ '@babel/preset-react' ] },
	},
} ).run( 'no-conditional-text-nodes-with-siblings', rule, {
	valid: [
		// wrapped in a <span>
		{
			code: '<Text><span>{ cond && sprintf( __( "Joined %s" ), d ) }</span></Text>',
		},
		// single child, no siblings
		{
			code: '<Text>{ cond && __( "only" ) }</Text>',
		},
		// not a JSX child — a prop value
		{
			code: '<Comp label={ cond && __( "x" ) } />',
		},
		// a non-i18n call is ignored in the name-based fallback
		{
			code: '<Text>{ url }{ cond && getString() }</Text>',
		},
	],

	invalid: [
		// wp-i18n sprintf/__ conditionally rendered next to a sibling
		{
			code: '<Text>{ url }{ cond && sprintf( __( "Joined %s" ), d ) }</Text>',
			errors: [ { messageId: 'conditional-text-node' } ],
		},
		// wp-i18n __ conditionally rendered next to an element sibling
		{
			code: '<Text><span />{ cond && __( "Joined" ) }</Text>',
			errors: [ { messageId: 'conditional-text-node' } ],
		},
		// static i18n text node preceded by a conditional sibling
		{
			code: '<Text>{ a && b }{ __( "static" ) }</Text>',
			errors: [ { messageId: 'text-node-preceded-by-conditional' } ],
		},
	],
} );
