/**
 * @fileoverview Ensure JSX className adheres to CSS namespace guidelines
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */
'use strict';

var EXPECTED_FOO_ERROR, EXPECTED_FOO_PREFIX_ERROR;

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require( '../../../lib/rules/jsx-classname-namespace' ),
	RuleTester = require( 'eslint' ).RuleTester;

//------------------------------------------------------------------------------
// Utility
//------------------------------------------------------------------------------

/**
 * Given a message containing data terms, format the string using the specified
 * terms object.
 *
 * @see https://github.com/eslint/eslint/blob/v2.12.0/lib/eslint.js#L964-L971
 *
 * @param  {String} message Message template
 * @param  {Object} terms   Terms
 * @return {String}         Formatted message
 */
function formatMessage( message, terms ) {
	return message.replace( /\{\{\s*(.+?)\s*\}\}/g, function( fullMatch, term ) {
		if ( terms.hasOwnProperty( term ) ) {
			return terms[ term ];
		}

		return fullMatch;
	} );
}

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

EXPECTED_FOO_ERROR = formatMessage( rule.ERROR_MESSAGE, { expected: 'foo' } );
EXPECTED_FOO_PREFIX_ERROR = formatMessage( rule.ERROR_MESSAGE, { expected: 'foo__ prefix' } );

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

( new RuleTester() ).run( 'jsx-classname-namespace', rule, {
	valid: [
		{
			code: 'export default function() { return <Foo className="foo" />; }',
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js'
		},
		{
			code: 'export default function() { return <Foo className="quux foo" />; }',
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js'
		},
		{
			code: 'export default () => <Foo className="foo" />;',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js'
		},
		{
			code: 'const Foo = () => <Foo className="foo" />; export default Foo;',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js'
		},
		{
			code: 'import localize from "./localize"; const Foo = () => <Foo className="foo" />; export default localize( localize( Foo ) );',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js'
		},
		{
			code: 'import connect from "./connect"; const Foo = () => <Foo className="foo" />; export default connect()( Foo );',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js'
		},
		{
			code: 'const Foo = () => <Foo className="foo" />; module.exports = Foo;',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js'
		},
		{
			code: 'const localize = require( "./localize" ); const Foo = () => <Foo className="foo" />; module.exports = localize( localize( Foo ) );',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true } },
			filename: '/tmp/foo/index.js'
		},
		{
			code: 'const connect = require( "./connect" ); const Foo = () => <Foo className="foo" />; module.exports = connect()( Foo );',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true } },
			filename: '/tmp/foo/index.js'
		},
		{
			code: 'function Foo() { return <Foo className="foo" />; } export default Foo;',
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js'
		},
		{
			code: 'module.exports = function() { return <Foo className="foo" />; }',
			parserOptions: { ecmaFeatures: { jsx: true } },
			filename: '/tmp/foo/index.js'
		},
		{
			code: 'export default React.createClass( { render: function() { return <Foo className="foo" />; } } );',
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js'
		},
		{
			code: 'export default React.createClass( { render() { return <Foo className="foo"><div className="foo__child" /></Foo>; } } );',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js'
		},
		{
			code: 'const isOk = true; export default React.createClass( { render() { return <Foo className="foo">{ isOk && <div className="foo__child" /> }</Foo>; } } );',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js'
		},
		{
			code: 'export default React.createClass( { child() { return <div className="foo__child" />; }, render() { return <Foo className="foo" />; } } );',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js'
		},
		{
			code: 'function child() { return <Foo className="foo__child" />; }',
			parserOptions: { ecmaFeatures: { jsx: true } },
			filename: '/tmp/foo/index.js'
		},
		{
			code: 'function child() { return <Foo className="quux foo__child" />; }',
			parserOptions: { ecmaFeatures: { jsx: true } },
			filename: '/tmp/foo/index.js'
		},
		{
			code: 'export default class Foo { render() { return <Foo className="foo" />; } }',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js'
		},
		{
			code: 'import localize from "./localize"; class Foo { render() { return <Foo className="foo" />; } } export default localize( Foo );',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js'
		},
		{
			code: 'import connect from "./connect"; class Foo { render() { return <Foo className="foo" />; } } export default connect()( Foo );',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js'
		}
	],

	invalid: [
		{
			code: 'export default function() { return <Foo className="foobar" />; }',
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_ERROR
			} ]
		},
		{
			code: 'export default function() { return <Foo className="quux foobar" />; }',
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_ERROR
			} ]
		},
		{
			code: 'export default () => <Foo className="foobar" />;',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_ERROR
			} ]
		},
		{
			code: 'const Foo = () => <Foo className="foobar" />; export default Foo;',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_ERROR
			} ]
		},
		{
			code: 'import localize from "./localize"; const Foo = () => <Foo className="foobar" />; export default localize( localize( Foo ) );',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_ERROR
			} ]
		},
		{
			code: 'import connect from "./connect"; const Foo = () => <Foo className="foobar" />; export default connect()( Foo );',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_ERROR
			} ]
		},
		{
			code: 'const Foo = () => <Foo className="foobar" />; module.exports = Foo;',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true } },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_ERROR
			} ]
		},
		{
			code: 'const localize = require( "./localize" ); const Foo = () => <Foo className="foobar" />; module.exports = localize( localize( Foo ) );',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true } },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_ERROR
			} ]
		},
		{
			code: 'const connect = require( "./connect" ); const Foo = () => <Foo className="foobar" />; module.exports = connect()( Foo );',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true } },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_ERROR
			} ]
		},
		{
			code: 'function Foo() { return <Foo className="foobar" />; } export default Foo;',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_ERROR
			} ]
		},
		{
			code: 'module.exports = function() { return <Foo className="foobar" />; }',
			parserOptions: { ecmaFeatures: { jsx: true } },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_ERROR
			} ]
		},
		{
			code: 'export default React.createClass( { render: function() { return <Foo className="foobar" />; } } );',
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_ERROR
			} ]
		},
		{
			code: 'export default React.createClass( { render() { return <Foo className="foo"><div className="foobar__child" /></Foo>; } } );',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_PREFIX_ERROR
			} ]
		},
		{
			code: 'const isOk = true; export default React.createClass( { render() { return <Foo className="foo">{ isOk && <div className="foobar__child" /> }</Foo>; } } );',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_PREFIX_ERROR
			} ]
		},
		{
			code: 'export default React.createClass( { child() { return <div className="foobar__child" />; }, render() { return <Foo className="foo" />; } } );',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_PREFIX_ERROR
			} ]
		},
		{
			code: 'function child() { return <Foo className="foobar__child" />; }',
			parserOptions: { ecmaFeatures: { jsx: true } },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_PREFIX_ERROR
			} ]
		},
		{
			code: 'function child() { return <Foo className="quux foobar__child" />; }',
			parserOptions: { ecmaFeatures: { jsx: true } },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_PREFIX_ERROR
			} ]
		},
		{
			code: 'export default class Foo { render() { return <Foo className="foobar" />; } }',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_ERROR
			} ]
		},
		{
			code: 'import localize from "./localize"; class Foo { render() { return <Foo className="foobar" />; } } export default localize( Foo );',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_ERROR
			} ]
		},
		{
			code: 'import connect from "./connect"; class Foo { render() { return <Foo className="foobar" />; } } export default connect()( Foo );',
			env: { es6: true },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
			filename: '/tmp/foo/index.js',
			errors: [ {
				message: EXPECTED_FOO_ERROR
			} ]
		}
	]
} );
