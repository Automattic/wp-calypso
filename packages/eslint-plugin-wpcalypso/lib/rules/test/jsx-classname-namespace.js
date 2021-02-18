/**
 * @file Ensure JSX className adheres to CSS namespace guidelines
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require( '../jsx-classname-namespace' );
const formatMessage = require( '../../../test-utils/format-message' );
const { RuleTester } = require( 'eslint' );

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

const EXPECTED_FOO_ERROR = formatMessage( rule.ERROR_MESSAGE, { expected: 'foo__ prefix' } );

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

new RuleTester( {
	parser: require.resolve( 'babel-eslint' ),
	parserOptions: {
		ecmaFeatures: { jsx: true },
		sourceType: 'module',
	},
} ).run( 'jsx-classname-namespace', rule, {
	valid: [
		{
			code: 'export default function() { return <Foo className="foo" />; }',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'export default function() { return <Foo className="quux foo" />; }',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'export default function() { return <div className="foo__child" />; }',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'export default class Foo { render() { return <Foo className="foo" />; } }',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'export default function() { return <div><div className="foo" /></div>; }',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'export default function() { return <div className="foo__child-example2" />; }',
			filename: '/tmp/foo/index.js',
		},
		{
			code:
				'import ReactDOM from "react-dom"; ReactDOM.render( <div className="quux" />, document.body );',
			filename: '/tmp/foo/index.js',
		},
		{
			code:
				'import ReactDOM from "react-dom"; ReactDOM.render( <div className="quux"><div className="quux__child" /></div>, document.body );',
			filename: '/tmp/foo/index.js',
		},
		{
			code:
				'import { render } from "react-dom"; render( <div className="quux" />, document.body );',
			filename: '/tmp/foo/index.js',
		},
		{
			code:
				'import { render } from "react-dom"; render( <div className="quux"><div className="quux__child" /></div>, document.body );',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'export default function() { return <div className="foo" />; }',
			filename: '/tmp/foo/foo-child.js',
		},
		{
			code: 'export default function() { return <div className="foo-child" />; }',
			filename: '/tmp/foo/foo-child.js',
		},
		{
			code: 'export default function() { return <div className="foo__child" />; }',
			filename: '/tmp/foo/foo-child.js',
		},
		{
			code: 'export default function() { return <div className="foo-child__child" />; }',
			filename: '/tmp/foo/foo-child.js',
		},
		{
			code: 'export default function() { return <div className="foo"></div>; }',
			filename: '/tmp/foo/bar.js',
			options: [ { rootFiles: [ 'bar.js' ] } ],
		},
		{
			code:
				'export default class Foo { child() { return <div className="foo" />; } render() { return this.child(); } };',
			filename: '/tmp/foo/index.js',
		},
	],

	invalid: [
		{
			code: 'export default function() { return <Foo className="foobar" />; }',
			filename: '/tmp/foo/index.js',
			errors: [ { message: EXPECTED_FOO_ERROR } ],
		},
		{
			code: 'export default () => <Foo className="foobar" />;',
			filename: '/tmp/foo/index.js',
			errors: [ { message: EXPECTED_FOO_ERROR } ],
		},
		{
			code: 'export default function() { return <Foo className="quux foobar" />; }',
			filename: '/tmp/foo/index.js',
			errors: [ { message: EXPECTED_FOO_ERROR } ],
		},
		{
			code: 'function child() { return <Foo className="foobar__child" />; }',
			filename: '/tmp/foo/index.js',
			errors: [ { message: EXPECTED_FOO_ERROR } ],
		},
		{
			code: 'function child() { return <Foo className="quux foobar__child" />; }',
			filename: '/tmp/foo/index.js',
			errors: [ { message: EXPECTED_FOO_ERROR } ],
		},
		{
			code: 'export default function() { return <div className="foo__" />; }',
			filename: '/tmp/foo/index.js',
			errors: [ { message: EXPECTED_FOO_ERROR } ],
		},
		{
			code: 'export default function() { return <Foo className="foo__child_example" />; }',
			filename: '/tmp/foo/index.js',
			errors: [ { message: EXPECTED_FOO_ERROR } ],
		},
		{
			code: 'export default function() { return <div className="bar"></div>; }',
			filename: '/tmp/foo/bar.js',
			options: [ { rootFiles: [ 'bar.js' ] } ],
			errors: [ { message: EXPECTED_FOO_ERROR } ],
		},
	],
} );
