/* eslint-disable max-len */

/**
 * External dependencies
 */
const babel = require( 'babel-core' );

describe( 'babel-plugin-transform-wpcalypso-async', () => {
	function transform( code, async = true ) {
		return babel.transform( code, {
			plugins: [ 'syntax-jsx', [ __dirname + '/../', { async } ] ],
		} ).code;
	}

	describe( '<AsyncLoad require />', () => {
		it( 'should not transform other components', () => {
			const code = transform( '<div require="foo" />' );

			expect( code ).toBe( '<div require="foo" />;' );
		} );

		it( 'should do nothing to other prop strings', () => {
			const code = transform( '<AsyncLoad other="foo" />' );

			expect( code ).toBe( '<AsyncLoad other="foo" />;' );
		} );

		it( 'should not transform non-strings', () => {
			const code = transform( '<AsyncLoad require={ true } />' );

			expect( code ).toBe( '<AsyncLoad require={true} />;' );
		} );

		describe( 'async', () => {
			it( 'should replace a require string prop with hoisting', () => {
				const code = transform( 'export default () => <AsyncLoad require="foo" />;' );

				expect( code ).toBe(
					'var _ref = function (callback) {\n  require.ensure("foo", function (require) {\n    callback(require("foo").__esModule ? require("foo").default : require("foo"));\n  }, "async-load-foo");\n};\n\nexport default (() => <AsyncLoad require={_ref} />);'
				);
			} );
		} );

		describe( 'sync', () => {
			it( 'should replace a require string prop with hoisting', () => {
				const code = transform( 'export default () => <AsyncLoad require="foo" />;', false );

				expect( code ).toBe(
					'var _ref = function (callback) {\n  callback(require("foo").__esModule ? require("foo").default : require("foo"));\n};\n\nexport default (() => <AsyncLoad require={_ref} />);'
				);
			} );
		} );
	} );

	describe( 'asyncRequire', () => {
		it( 'should not transform other call expressions', () => {
			const code = transform( 'requireAsync( "foo" );' );

			expect( code ).toBe( 'requireAsync("foo");' );
		} );

		it( 'should remove node if invalid call', () => {
			const code = transform( 'asyncRequire();' );

			expect( code ).toBe( '' );
		} );

		describe( 'async', () => {
			it( 'should call require directly after ensure when no callback', () => {
				const code = transform( 'asyncRequire( "foo/bar" );' );

				expect( code ).toBe(
					'require.ensure("foo/bar", function (require) {\n  require("foo/bar").__esModule ? require("foo/bar").default : require("foo/bar");\n}, "async-load-foo-bar");'
				);
			} );

			it( 'should invoke callback with require after ensure', () => {
				const code = transform( 'asyncRequire( "foo/bar", cb );' );

				expect( code ).toBe(
					'require.ensure("foo/bar", function (require) {\n  cb(require("foo/bar").__esModule ? require("foo/bar").default : require("foo/bar"));\n}, "async-load-foo-bar");'
				);
			} );
		} );

		describe( 'sync', () => {
			it( 'should call require directly when no callback', () => {
				const code = transform( 'asyncRequire( "foo" );', false );

				expect( code ).toBe(
					'require("foo").__esModule ? require("foo").default : require("foo");'
				);
			} );

			it( 'should invoke callback with require', () => {
				const code = transform( 'asyncRequire( "foo", cb );', false );

				expect( code ).toBe(
					'cb(require("foo").__esModule ? require("foo").default : require("foo"));'
				);
			} );
		} );
	} );
} );
