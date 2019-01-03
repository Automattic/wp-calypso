/** @format */
/**
 * @fileoverview Ensure JSX className adheres to CSS namespace guidelines
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require( '../jsx-classname-namespace' ),
	formatMessage = require( '../../../test-utils/format-message' ),
	RuleTester = require( 'eslint' ).RuleTester;

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

const EXPECTED_FOO_ERROR = formatMessage( rule.ERROR_MESSAGE, { expected: 'foo' } );
const EXPECTED_FOO_PREFIX_ERROR = formatMessage( rule.ERROR_MESSAGE, { expected: 'foo__ prefix' } );

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

new RuleTester( {
	parser: 'babel-eslint',
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
			code: 'export default function() { const foo = <Foo className="foo" />; return foo; }',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'export default function() { return <Foo className="quux foo" />; }',
			filename: '/tmp/foo/index.js',
		},
		{
			code:
				'export default function() { const child = <div className="foo__child" />; return <Foo className="foo">{ child }</Foo>; }',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'export default () => <Foo className="foo" />;',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'export default () => { return <Foo className="foo" />; }',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'const Foo = () => <Foo className="foo" />; export default Foo;',
			filename: '/tmp/foo/index.js',
		},
		{
			code:
				'import localize from "./localize"; const Foo = () => <Foo className="foo" />; export default localize( localize( Foo ) );',
			filename: '/tmp/foo/index.js',
		},
		{
			code:
				'import connect from "./connect"; const Foo = () => <Foo className="foo" />; export default connect()( Foo );',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'const Foo = () => <Foo className="foo" />; module.exports = Foo;',
			filename: '/tmp/foo/index.js',
		},
		{
			code:
				'const localize = require( "./localize" ); const Foo = () => <Foo className="foo" />; module.exports = localize( localize( Foo ) );',
			filename: '/tmp/foo/index.js',
		},
		{
			code:
				'const connect = require( "./connect" ); const Foo = () => <Foo className="foo" />; module.exports = connect()( Foo );',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'function Foo() { return <Foo className="foo" />; } export default Foo;',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'module.exports = function() { return <Foo className="foo" />; }',
			filename: '/tmp/foo/index.js',
		},
		{
			code:
				'export default React.createClass( { render: function() { return <Foo className="foo" />; } } );',
			filename: '/tmp/foo/index.js',
		},
		{
			code:
				'export default React.createClass( { render: function() { const foo = <Foo className="foo" />; return foo; } } );',
			filename: '/tmp/foo/index.js',
		},
		{
			code:
				'export default React.createClass( { render: function() { return ( <Foo className="foo" /> ); } } );',
			filename: '/tmp/foo/index.js',
		},
		{
			code:
				'export default React.createClass( { render() { return <Foo className="foo"><div className="foo__child" /></Foo>; } } );',
			filename: '/tmp/foo/index.js',
		},
		{
			code:
				'export default React.createClass( { render() { const child = <div className="foo__child" />; return <Foo className="foo">{ child }</Foo>; } } );',
			filename: '/tmp/foo/index.js',
		},
		{
			code:
				'const isOk = true; export default React.createClass( { render() { return <Foo className="foo">{ isOk && <div className="foo__child" /> }</Foo>; } } );',
			filename: '/tmp/foo/index.js',
		},
		{
			code:
				'export default React.createClass( { child() { return <div className="foo__child" />; }, render() { return <Foo className="foo" />; } } );',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'function child() { return <Foo className="foo__child" />; }',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'function child() { return <Foo className="quux foo__child" />; }',
			filename: '/tmp/foo/index.js',
		},
		{
			code: 'export default class Foo { render() { return <Foo className="foo" />; } }',
			filename: '/tmp/foo/index.js',
		},
		{
			code:
				'import localize from "./localize"; class Foo { render() { return <Foo className="foo" />; } } export default localize( Foo );',
			filename: '/tmp/foo/index.js',
		},
		{
			code:
				'import connect from "./connect"; class Foo { render() { return <Foo className="foo" />; } } export default connect()( Foo );',
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
			code: 'export default function() { return <div className="foo__child" />; }',
			filename: '/tmp/foo/foo-child.js',
		},
		{
			code: 'export default function() { return <div className="foo__child-example2" />; }',
			filename: '/tmp/foo/foo-child.js',
		},
		{
			code: 'export default function() { return <div className="foo"></div>; }',
			filename: '/tmp/foo/foo.js',
			options: [ { rootFiles: [ 'foo.js' ] } ],
		},
	],

	invalid: [
		{
			code: 'export default function() { return <Foo className="foobar" />; }',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_ERROR,
				},
			],
		},
		{
			code: 'export default function() { const foo = <Foo className="foobar" />; return foo; }',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_ERROR,
				},
			],
		},
		{
			code:
				'export default function() { const child = <div className="foo" />; return <Foo className="foo">{ child }</Foo>; }',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_PREFIX_ERROR,
				},
			],
		},
		{
			code: 'export default function() { return <Foo className="quux foobar" />; }',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_ERROR,
				},
			],
		},
		{
			code: 'export default () => <Foo className="foobar" />;',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_ERROR,
				},
			],
		},
		{
			code: 'export default () => { return <Foo className="foobar" />; }',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_ERROR,
				},
			],
		},
		{
			code: 'const Foo = () => <Foo className="foobar" />; export default Foo;',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_ERROR,
				},
			],
		},
		{
			code:
				'import localize from "./localize"; const Foo = () => <Foo className="foobar" />; export default localize( localize( Foo ) );',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_ERROR,
				},
			],
		},
		{
			code:
				'import connect from "./connect"; const Foo = () => <Foo className="foobar" />; export default connect()( Foo );',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_ERROR,
				},
			],
		},
		{
			code: 'const Foo = () => <Foo className="foobar" />; module.exports = Foo;',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_ERROR,
				},
			],
		},
		{
			code:
				'const localize = require( "./localize" ); const Foo = () => <Foo className="foobar" />; module.exports = localize( localize( Foo ) );',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_ERROR,
				},
			],
		},
		{
			code:
				'const connect = require( "./connect" ); const Foo = () => <Foo className="foobar" />; module.exports = connect()( Foo );',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_ERROR,
				},
			],
		},
		{
			code: 'function Foo() { return <Foo className="foobar" />; } export default Foo;',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_ERROR,
				},
			],
		},
		{
			code: 'module.exports = function() { return <Foo className="foobar" />; }',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_ERROR,
				},
			],
		},
		{
			code:
				'export default React.createClass( { render: function() { return <Foo className="foobar" />; } } );',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_ERROR,
				},
			],
		},
		{
			code:
				'export default React.createClass( { render: function() { const foo = <Foo className="foobar" />; return foo; } } );',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_ERROR,
				},
			],
		},
		{
			code:
				'export default React.createClass( { render: function() { return ( <Foo className="foobar" /> ); } } );',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_ERROR,
				},
			],
		},
		{
			code:
				'export default React.createClass( { render() { return <Foo className="foo"><div className="foobar__child" /></Foo>; } } );',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_PREFIX_ERROR,
				},
			],
		},
		{
			code:
				'export default React.createClass( { render() { const child = <div className="foo" />; return <Foo className="foo">{ child }</Foo>; } } );',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_PREFIX_ERROR,
				},
			],
		},
		{
			code:
				'const isOk = true; export default React.createClass( { render() { return <Foo className="foo">{ isOk && <div className="foobar__child" /> }</Foo>; } } );',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_PREFIX_ERROR,
				},
			],
		},
		{
			code:
				'export default React.createClass( { child() { return <div className="foobar__child" />; }, render() { return <Foo className="foo" />; } } );',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_PREFIX_ERROR,
				},
			],
		},
		{
			code: 'function child() { return <Foo className="foobar__child" />; }',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_PREFIX_ERROR,
				},
			],
		},
		{
			code: 'function child() { return <Foo className="quux foobar__child" />; }',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_PREFIX_ERROR,
				},
			],
		},
		{
			code: 'export default class Foo { render() { return <Foo className="foobar" />; } }',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_ERROR,
				},
			],
		},
		{
			code:
				'import localize from "./localize"; class Foo { render() { return <Foo className="foobar" />; } } export default localize( Foo );',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_ERROR,
				},
			],
		},
		{
			code:
				'import connect from "./connect"; class Foo { render() { return <Foo className="foobar" />; } } export default connect()( Foo );',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_ERROR,
				},
			],
		},
		{
			code: 'export default function() { return <div className="foo" />; }',
			filename: '/tmp/foo/foo-child.js',
			errors: [
				{
					message: formatMessage( rule.ERROR_MESSAGE, {
						expected: `foo__ prefix or to be in one of ${ rule.DEFAULT_ROOT_FILES.join( ', ' ) }`,
					} ),
				},
			],
		},
		{
			code: 'export default function() { return <div className="foo" />; }',
			filename: '/tmp/foo/foo-child.js',
			options: [ { rootFiles: [ 'one.js' ] } ],
			errors: [
				{
					message: formatMessage( rule.ERROR_MESSAGE, {
						expected: 'foo__ prefix or to be in one.js',
					} ),
				},
			],
		},
		{
			code:
				'export default function() { return <Foo className="foo"><div className="foo__" /></Foo>; }',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_PREFIX_ERROR,
				},
			],
		},
		{
			code:
				'export default function() { return <Foo className="foo"><div className="foo__child__example" /></Foo>; }',
			filename: '/tmp/foo/index.js',
			errors: [
				{
					message: EXPECTED_FOO_PREFIX_ERROR,
				},
			],
		},
		{
			code: 'export default function() { return <div><div className="foo" /></div>; }',
			filename: '/tmp/foo/foo-child.js',
			errors: [
				{
					message: EXPECTED_FOO_PREFIX_ERROR,
				},
			],
		},
	],
} );
