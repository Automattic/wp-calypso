/** @format */
/**
 * External dependencies
 */
const babel = require( '@babel/core' );

describe( 'babel-plugin-transform-wpcalypso-async', () => {
	function transform( code, async = true ) {
		return babel.transformSync( code, {
			configFile: false,
			plugins: [ '@babel/plugin-syntax-jsx', [ require( '..' ), { async } ] ],
		} ).code;
	}

	describe( '<AsyncLoad require />', () => {
		test( 'should not transform other components', () => {
			const code = transform( '<div require="foo" />' );

			expect( code ).toBe( '<div require="foo" />;' );
		} );

		test( 'should do nothing to other prop strings', () => {
			const code = transform( '<AsyncLoad other="foo" />' );

			expect( code ).toBe( '<AsyncLoad other="foo" />;' );
		} );

		test( 'should not transform non-strings', () => {
			const code = transform( '<AsyncLoad require={ true } />' );

			expect( code ).toBe( '<AsyncLoad require={true} />;' );
		} );

		describe( 'async', () => {
			test( 'should replace a require string prop with hoisting', () => {
				const code = transform( 'export default () => <AsyncLoad require="foo" />;' );

				expect( code ).toBe(
					'var _ref = function (callback) {\n  import(\n  /*webpackChunkName: "async-load-foo", webpackPrefetch: true*/\n  "foo").then(function load(mod) {\n' +
						'    callback(mod.__esModule ? mod.default : mod);\n' +
						'  });\n};\n\nexport default (() => <AsyncLoad require={_ref} />);'
				);
			} );
		} );

		describe( 'sync', () => {
			test( 'should replace a require string prop with hoisting', () => {
				const code = transform( 'export default () => <AsyncLoad require="foo" />;', false );

				expect( code ).toBe(
					'var _ref = function (callback) {\n  callback(require("foo").__esModule ? require("foo").default ' +
						': require("foo"));\n};\n\nexport default (() => <AsyncLoad require={_ref} />);'
				);
			} );
		} );
	} );

	describe( 'asyncRequire', () => {
		test( 'should not transform other call expressions', () => {
			const code = transform( 'requireAsync( "foo" );' );

			expect( code ).toBe( 'requireAsync("foo");' );
		} );

		test( 'should remove node if invalid call', () => {
			const code = transform( 'asyncRequire();' );

			expect( code ).toBe( '' );
		} );

		describe( 'async', () => {
			test( 'should just issue the import if no callback is specified', () => {
				const code = transform( 'asyncRequire( "foo/bar" );' );

				expect( code ).toBe(
					'import(\n/*webpackChunkName: "async-load-foo-bar", webpackPrefetch: true*/\n"foo/bar");'
				);
			} );

			test( 'should invoke callback with require after ensure', () => {
				const code = transform( 'asyncRequire( "foo/bar", cb );' );

				expect( code ).toBe(
					'import(\n/*webpackChunkName: "async-load-foo-bar", webpackPrefetch: true*/\n"foo/bar").then(function load(mod) {\n  cb(mod.__esModule ? ' +
						'mod.default : mod);\n});'
				);
			} );
		} );

		describe( 'sync', () => {
			test( 'should call require directly when no callback', () => {
				const code = transform( 'asyncRequire( "foo" );', false );

				expect( code ).toBe(
					'require("foo").__esModule ? require("foo").default : require("foo");'
				);
			} );

			test( 'should invoke callback with require', () => {
				const code = transform( 'asyncRequire( "foo", cb );', false );

				expect( code ).toBe(
					'cb(require("foo").__esModule ? require("foo").default : require("foo"));'
				);
			} );
		} );
	} );
} );
