/**
 * @file Ensure capitalised function components do not return bare text nodes.
 * @author Automattic
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const RuleTester = require( 'eslint' ).RuleTester;
const plugin = require( '../../..' );

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

new RuleTester( {
	languageOptions: {
		parserOptions: { ecmaFeatures: { jsx: true } },
	},
} ).run( 'no-return-text-nodes', plugin.rules[ 'no-return-text-nodes' ], {
	valid: [
		// returns JSX
		{
			code: 'function Foo() { return <span>hi</span>; }',
		},
		// returns null
		{
			code: 'function Foo() { return null; }',
		},
		// non-component (lowercase) returning a string is ignored
		{
			code: 'function getLabel() { return "hi"; }',
		},
	],

	invalid: [
		// component returning a string literal
		{
			code: 'function Foo() { return "hi"; }',
			errors: [ { messageId: 'return-value-is-text-node' } ],
		},
		// component returning a template literal
		{
			code: 'function Foo() { return `hi ${ x }`; }',
			errors: [ { messageId: 'return-value-is-text-node' } ],
		},
		// component returning a string from a nested branch
		{
			code: 'function Foo() { if ( x ) { return "hi"; } return <span />; }',
			errors: [ { messageId: 'return-value-is-text-node' } ],
		},
	],
} );
