/**
 * External dependencies
 */
const babel = require( '@babel/core' );

describe( 'babel-plugin-transform-wpcalypso-async', () => {
	function transform( code, options = { async: true } ) {
		return babel.transformSync( code, {
			configFile: false,
			parserOpts: { plugins: [ 'jsx' ] },
			plugins: [ [ require( '..' ), options ] ],
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
					'var _ref = function (callback) {\n  import(\n  /*webpackChunkName: "async-load-foo"*/\n  "foo").then(function load(mod) {\n' +
						'    callback(mod.default);\n' +
						'  });\n};\n\nexport default (() => <AsyncLoad require={_ref} />);'
				);
			} );
		} );

		describe( 'sync', () => {
			test( 'should replace a require string prop with hoisting', () => {
				const code = transform( 'export default () => <AsyncLoad require="foo" />;', {
					async: false,
				} );

				expect( code ).toBe(
					'var _ref = function (callback) {\n  callback(require("foo").__esModule ? require("foo").default ' +
						': require("foo"));\n};\n\nexport default (() => <AsyncLoad require={_ref} />);'
				);
			} );
		} );

		describe( 'ignore', () => {
			test( 'should replace a require string prop with hoisting', () => {
				const code = transform( 'export default () => <AsyncLoad require="foo" />;', {
					ignore: true,
				} );

				expect( code ).toBe(
					'var _ref = function (callback) {};\n\nexport default (() => <AsyncLoad require={_ref} />);'
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

				expect( code ).toBe( 'import(\n/*webpackChunkName: "async-load-foo-bar"*/\n"foo/bar");' );
			} );

			test( 'should invoke callback with require after ensure', () => {
				const code = transform( 'asyncRequire( "foo/bar", cb );' );

				expect( code ).toBe(
					'import(\n/*webpackChunkName: "async-load-foo-bar"*/\n"foo/bar").then(function load(mod) {\n  cb(mod.default);\n});'
				);
			} );
		} );

		describe( 'sync', () => {
			test( 'should call require directly when no callback', () => {
				const code = transform( 'asyncRequire( "foo" );', { async: false } );

				expect( code ).toBe(
					'require("foo").__esModule ? require("foo").default : require("foo");'
				);
			} );

			test( 'should invoke callback with require', () => {
				const code = transform( 'asyncRequire( "foo", cb );', { async: false } );

				expect( code ).toBe(
					'cb(require("foo").__esModule ? require("foo").default : require("foo"));'
				);
			} );
		} );

		describe( 'ignore', () => {
			test( 'should simply ignore the asyncRequire call', () => {
				const code = transform( 'asyncRequire( "foo" );', { ignore: true } );

				expect( code ).toBe( '' );
			} );
		} );
	} );

	test( 'AsyncLoad with further import transformation', () => {
		// Babel plugin that transforms import() into patchedImport()
		const patchImportPlugin = ( { types } ) => ( {
			visitor: {
				Import( path ) {
					path.replaceWith( types.identifier( 'patchedImport' ) );
				},
			},
		} );

		const code = '<AsyncLoad require="foo" />;';

		// Use both the AsyncLoad and patchedImport transform
		const transformResult = babel.transformSync( code, {
			configFile: false,
			parserOpts: { plugins: [ 'jsx', 'dynamicImport' ] },
			plugins: [ [ require( '..' ), { async: true } ], patchImportPlugin ],
		} );

		// Check that the transformed code has been further transformed with patchedImport
		expect( transformResult.code ).toBe(
			[
				'<AsyncLoad require={function (callback) {',
				'  patchedImport(',
				'  /*webpackChunkName: "async-load-foo"*/',
				'  "foo").then(function load(mod) {',
				'    callback(mod.default);',
				'  });',
				'}} />;',
			].join( '\n' )
		);
	} );
} );
