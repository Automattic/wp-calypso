const babel = require( '@babel/core' );

describe( 'babel-plugin-transform-wpcalypso-async', () => {
	function transform( code, options = {} ) {
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
					'var _ref = () => import( /*webpackChunkName: "async-load-foo"*/"foo");\n' +
						'export default (() => <AsyncLoad require={_ref} />);'
				);
			} );
		} );

		describe( 'ignore', () => {
			test( 'should replace a require string prop with hoisting', () => {
				const code = transform( 'export default () => <AsyncLoad require="foo" />;', {
					ignore: true,
				} );

				expect( code ).toBe(
					'var _ref = () => {\n' +
						'  throw new Error("ignoring load of: async-load-foo");\n' +
						'};\n' +
						'export default (() => <AsyncLoad require={_ref} />);'
				);
			} );
		} );
	} );

	describe( 'asyncRequire', () => {
		test( 'should not transform other call expressions', () => {
			const code = transform( 'requireAsync( "foo" );' );

			expect( code ).toBe( 'requireAsync("foo");' );
		} );

		test( 'should not transform if there is no string argument', () => {
			const code = transform( 'asyncRequire();' );

			expect( code ).toBe( 'asyncRequire();' );
		} );

		describe( 'async', () => {
			test( 'should transform asyncRequire to an import with nice name', () => {
				const code = transform( 'asyncRequire( "foo/bar" );' );

				expect( code ).toBe( 'import( /*webpackChunkName: "async-load-foo-bar"*/"foo/bar");' );
			} );
		} );

		describe( 'ignore', () => {
			test( 'should transform asyncRequire into error-throwing function', () => {
				const code = transform( 'asyncRequire( "foo" );', { ignore: true } );

				expect( code ).toBe( 'Promise.reject(new Error("ignoring load of: async-load-foo"));' );
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

		const code = 'export default () => <AsyncLoad require="foo" />;';

		// Use both the AsyncLoad and patchedImport transform
		const transformResult = babel.transformSync( code, {
			configFile: false,
			parserOpts: { plugins: [ 'jsx', 'dynamicImport' ] },
			plugins: [ [ require( '..' ) ], patchImportPlugin ],
		} );

		// Check that the transformed code has been further transformed with patchedImport
		expect( transformResult.code ).toBe(
			'var _ref = () => patchedImport( /*webpackChunkName: "async-load-foo"*/"foo");\n' +
				'export default (() => <AsyncLoad require={_ref} />);'
		);
	} );
} );
