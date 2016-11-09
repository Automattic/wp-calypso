/* eslint-disable max-len */

/**
 * External dependencies
 */
import { expect } from 'chai';
const babel = require( 'babel-core' );

describe( 'babel-plugin-transform-wpcalypso-async', () => {
	function transform( code, async = true ) {
		return babel.transform( code, {
			plugins: [ 'syntax-jsx', [ __dirname + '/../', { async } ] ]
		} ).code;
	}

	describe( '<AsyncLoad require />', () => {
		it( 'should not transform other components', () => {
			const code = transform( '<div require="foo" />' );

			expect( code ).to.equal( '<div require="foo" />;' );
		} );

		it( 'should do nothing to other prop strings', () => {
			const code = transform( '<AsyncLoad other="foo" />' );

			expect( code ).to.equal( '<AsyncLoad other="foo" />;' );
		} );

		it( 'should not transform non-strings', () => {
			const code = transform( '<AsyncLoad require={ true } />' );

			expect( code ).to.equal( '<AsyncLoad require={true} />;' );
		} );

		context( 'async', () => {
			it( 'should replace a require string prop with hoisting', () => {
				const code = transform( 'export default () => <AsyncLoad require="foo" />;' );

				expect( code ).to.equal( 'var _ref = function (callback) {\n  require.ensure("foo", function (require) {\n    callback(require("foo").__esModule ? require("foo").default : require("foo"));\n  }, "async-load-foo");\n};\n\nexport default (() => <AsyncLoad require={_ref} />);' );
			} );
		} );

		context( 'sync', () => {
			it( 'should replace a require string prop with hoisting', () => {
				const code = transform( 'export default () => <AsyncLoad require="foo" />;', false );

				expect( code ).to.equal( 'var _ref = function (callback) {\n  callback(require("foo").__esModule ? require("foo").default : require("foo"));\n};\n\nexport default (() => <AsyncLoad require={_ref} />);' );
			} );
		} );
	} );

	describe( 'asyncRequire', () => {
		it( 'should not transform other call expressions', () => {
			const code = transform( 'requireAsync( "foo" );' );

			expect( code ).to.equal( 'requireAsync("foo");' );
		} );

		it( 'should remove node if invalid call', () => {
			const code = transform( 'asyncRequire();' );

			expect( code ).to.equal( '' );
		} );

		context( 'async', () => {
			it( 'should call require directly after ensure when no callback', () => {
				const code = transform( 'asyncRequire( "foo/bar" );' );

				expect( code ).to.equal( 'require.ensure("foo/bar", function (require) {\n  require("foo/bar").__esModule ? require("foo/bar").default : require("foo/bar");\n}, "async-load-foo-bar");' );
			} );

			it( 'should invoke callback with require after ensure', () => {
				const code = transform( 'asyncRequire( "foo/bar", cb );' );

				expect( code ).to.equal( 'require.ensure("foo/bar", function (require) {\n  cb(require("foo/bar").__esModule ? require("foo/bar").default : require("foo/bar"));\n}, "async-load-foo-bar");' );
			} );
		} );

		context( 'sync', () => {
			it( 'should call require directly when no callback', () => {
				const code = transform( 'asyncRequire( "foo" );', false );

				expect( code ).to.equal( 'require("foo").__esModule ? require("foo").default : require("foo");' );
			} );

			it( 'should invoke callback with require', () => {
				const code = transform( 'asyncRequire( "foo", cb );', false );

				expect( code ).to.equal( 'cb(require("foo").__esModule ? require("foo").default : require("foo"));' );
			} );
		} );
	} );
} );
