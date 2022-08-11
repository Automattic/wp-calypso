/**
 * @file Ensure JSX className adheres to CSS namespace guidelines
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import { RuleTester } from 'eslint';
import rule, { ERROR_MESSAGE } from '../jsx-classname-namespace';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

new RuleTester( {
	parser: require.resolve( '@babel/eslint-parser' ),
	parserOptions: {
		ecmaFeatures: { jsx: true },
		sourceType: 'module',
	},
} ).run( 'jsx-classname-namespace', rule, {
	valid: [
		{
			code: 'export default function() { return <Foo className="quux foo" />; }',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'function child() { return <Foo className="quux foo__child" />; }',
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
			code: 'import ReactDOM from "react-dom"; ReactDOM.render( <div className="quux" />, document.body );',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'import ReactDOM from "react-dom"; ReactDOM.render( <div className="quux"><div className="quux__child" /></div>, document.body );',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'import { render } from "react-dom"; render( <div className="quux" />, document.body );',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'import { render } from "react-dom"; render( <div className="quux"><div className="quux__child" /></div>, document.body );',
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
			code: 'export default function() { return <Foo className="foo-child__child-attribute" />; }',
			filename: '/tmp/foo/index.js',
		},
	],

	invalid: [
		{
			code: 'export default function() { return <div className="foo__" />; }',
			filename: '/tmp/foo/index.js',
			errors: [ { message: ERROR_MESSAGE } ],
		},
		{
			code: 'export default function() { return <Foo className="foo__child_example" />; }',
			filename: '/tmp/foo/index.js',
			errors: [ { message: ERROR_MESSAGE } ],
		},
		{
			code: 'export default function() { return <Foo className="camelCase" />; }',
			filename: '/tmp/foo/index.js',
			errors: [ { message: ERROR_MESSAGE } ],
		},
		{
			code: 'export default function() { return <Foo className="Sentencecase" />; }',
			filename: '/tmp/foo/index.js',
			errors: [ { message: ERROR_MESSAGE } ],
		},
		{
			code: 'export default function() { return <Foo className="ALLCAPSCASE" />; }',
			filename: '/tmp/foo/index.js',
			errors: [ { message: ERROR_MESSAGE } ],
		},
		{
			code: 'export default function() { return <Foo className="TitleCase" />; }',
			filename: '/tmp/foo/index.js',
			errors: [ { message: ERROR_MESSAGE } ],
		},
		{
			code: 'export default function() { return <Foo className="snake_case" />; }',
			filename: '/tmp/foo/index.js',
			errors: [ { message: ERROR_MESSAGE } ],
		},
		{
			code: 'export default function() { return <Foo className="SNAKE_CASE_WITH_CAPS" />; }',
			filename: '/tmp/foo/index.js',
			errors: [ { message: ERROR_MESSAGE } ],
		},
		{
			code: 'export default function() { return <Foo className="foo__class__attribute" />; }',
			filename: '/tmp/foo/index.js',
			errors: [ { message: ERROR_MESSAGE } ],
		},
	],
} );
