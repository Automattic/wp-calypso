const fs = require( 'fs' );
const path = require( 'path' );
const webpack = require( 'webpack' );
const WebpackRTLPlugin = require( '../src' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );

const baseConfig = {
	mode: 'development',
	entry: path.join( __dirname, 'src/index.js' ),
	output: {
		path: path.resolve( __dirname, 'dist' ),
		filename: 'bundle.js',
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							modules: {
								localIdentName: '[local]',
							},
							url: false,
							importLoaders: 1,
						},
					},
				],
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin( {
			filename: 'style.css',
		} ),
		new WebpackRTLPlugin(),
	],
};

describe( 'Webpack RTL Plugin', () => {
	it( 'should export a function', () => {
		expect( typeof WebpackRTLPlugin ).toBe( 'function' );
		expect( typeof require( '../' ) ).toBe( 'function' );
	} );

	describe( 'Bundling', () => {
		const bundlePath = path.join( __dirname, 'dist/bundle.js' );
		const cssBundlePath = path.join( __dirname, 'dist/style.css' );
		const rtlCssBundlePath = path.join( __dirname, 'dist/style.rtl.css' );

		beforeAll(
			() =>
				new Promise( ( done ) => {
					webpack( baseConfig, ( err, stats ) => {
						if ( err ) {
							return done( err );
						}

						if ( stats.hasErrors() ) {
							return done( new Error( stats.toString() ) );
						}
						done();
					} );
				} )
		);

		it( 'should create a second bundle', () => {
			expect( fs.existsSync( bundlePath ) ).toBe( true );
			expect( fs.existsSync( cssBundlePath ) ).toBe( true );
			expect( fs.existsSync( rtlCssBundlePath ) ).toBe( true );
		} );

		it( 'should contain the correct content', () => {
			const contentCss = fs.readFileSync( cssBundlePath, 'utf-8' );
			const contentRrlCss = fs.readFileSync( rtlCssBundlePath, 'utf-8' );

			expect( contentCss ).toContain( 'padding-left: 10px;' );
			expect( contentRrlCss ).toContain( 'padding-right: 10px;' );
		} );
	} );

	describe( 'Test option', () => {
		let bundlePath;
		let cssBundlePath;
		let rtlCssBundlePath;

		beforeAll(
			() =>
				new Promise( ( done ) => {
					const config = {
						...baseConfig,
						entry: {
							'js/main.js': path.join( __dirname, 'src/index.js' ),
						},
						output: {
							path: path.resolve( __dirname, 'dist-test' ),
							filename: '[name]',
						},
						plugins: [
							new MiniCssExtractPlugin( {
								filename: 'css/style.css',
							} ),
							new WebpackRTLPlugin( {
								test: /css\//i,
							} ),
						],
					};

					webpack( config, ( err, stats ) => {
						if ( err ) {
							return done( err );
						}

						if ( stats.hasErrors() ) {
							return done( new Error( stats.toString() ) );
						}

						bundlePath = path.join( __dirname, 'dist-test/js/main.js' );
						cssBundlePath = path.join( __dirname, 'dist-test/css/style.css' );
						rtlCssBundlePath = path.join( __dirname, 'dist-test/css/style.rtl.css' );

						done();
					} );
				} )
		);

		it( 'should create a two css bundles', () => {
			expect( fs.existsSync( bundlePath ) ).toBe( true );
			expect( fs.existsSync( cssBundlePath ) ).toBe( true );
			expect( fs.existsSync( rtlCssBundlePath ) ).toBe( true );
		} );
	} );

	describe( 'Same path when no filename option', () => {
		let cssBundlePath;
		let rtlCssBundlePath;
		const cssPath = 'assets/css';

		beforeAll(
			() =>
				new Promise( ( done ) => {
					const config = {
						...baseConfig,
						output: {
							path: path.resolve( __dirname, 'dist-path' ),
							filename: 'bundle.js',
						},
						plugins: [
							new MiniCssExtractPlugin( {
								filename: path.join( cssPath, 'style.css' ),
							} ),
							new WebpackRTLPlugin(),
						],
					};

					webpack( config, ( err, stats ) => {
						if ( err ) {
							return done( err );
						}

						if ( stats.hasErrors() ) {
							return done( new Error( stats.toString() ) );
						}

						cssBundlePath = path.join( __dirname, 'dist-path', cssPath, 'style.css' );
						rtlCssBundlePath = path.join( __dirname, 'dist-path', cssPath, 'style.rtl.css' );

						done();
					} );
				} )
		);

		it( 'should create two css bundles with same path', () => {
			expect( fs.existsSync( cssBundlePath ) ).toBe( true );
			expect( fs.existsSync( rtlCssBundlePath ) ).toBe( true );
		} );
	} );

	describe( 'Rtlcss options', () => {
		const rtlCssBundlePath = path.join( __dirname, 'dist-options/style.rtl.css' );

		beforeAll(
			() =>
				new Promise( ( done ) => {
					const config = {
						...baseConfig,
						output: {
							path: path.resolve( __dirname, 'dist-options' ),
							filename: 'bundle.js',
						},
						plugins: [
							new MiniCssExtractPlugin( {
								filename: 'style.css',
							} ),
							new WebpackRTLPlugin( {
								options: {
									autoRename: true,
									stringMap: [
										{
											search: 'prev',
											replace: 'next',
											options: {
												scope: '*',
											},
										},
									],
								},
							} ),
						],
					};

					webpack( config, ( err, stats ) => {
						if ( err ) {
							return done( err );
						}

						if ( stats.hasErrors() ) {
							return done( new Error( stats.toString() ) );
						}

						done();
					} );
				} )
		);

		it( 'should follow the options given to rtlcss', () => {
			const contentRrlCss = fs.readFileSync( rtlCssBundlePath, 'utf-8' );
			expect( contentRrlCss ).toContain( '.next {' );
		} );
	} );

	describe( 'Rtlcss plugins', () => {
		const rtlCssBundlePath = path.join( __dirname, 'dist-options/style.rtl.css' );

		beforeAll( () => {
			return new Promise( function ( done ) {
				const config = {
					...baseConfig,
					output: {
						path: path.resolve( __dirname, 'dist-options' ),
						filename: 'bundle.js',
					},
					plugins: [
						new MiniCssExtractPlugin( {
							filename: 'style.css',
						} ),
						new WebpackRTLPlugin( {
							plugins: [
								// Based on github.com/MohammadYounes/rtlcss/issues/86#issuecomment-261875443
								{
									name: 'Skip variables',
									priority: 1,
									directives: { control: {}, value: [] },
									processors: [
										{
											name: '--',
											expr: /^--/im,
											action: ( prop, value ) => ( { prop, value } ),
										},
									],
								},
							],
						} ),
					],
				};

				webpack( config, ( err, stats ) => {
					if ( err ) {
						return done( err );
					}

					if ( stats.hasErrors() ) {
						return done( new Error( stats.toString() ) );
					}

					done();
				} );
			} );
		} );

		it( 'should follow the plugins given to rtlcss', () => {
			const contentRrlCss = fs.readFileSync( rtlCssBundlePath, 'utf-8' );
			expect( contentRrlCss ).toContain( 'brightest' );
		} );
	} );

	describe( 'Diff', () => {
		const rtlCssBundlePath = path.join( __dirname, 'dist-diff/style.rtl.css' );

		beforeAll( () => {
			return new Promise( function ( done ) {
				const config = {
					...baseConfig,
					output: {
						path: path.resolve( __dirname, 'dist-diff' ),
						filename: 'bundle.js',
					},
					plugins: [
						new MiniCssExtractPlugin( {
							filename: 'style.css',
						} ),
						new WebpackRTLPlugin( {
							diffOnly: true,
						} ),
					],
				};

				webpack( config, ( err, stats ) => {
					if ( err ) {
						return done( err );
					}

					if ( stats.hasErrors() ) {
						return done( new Error( stats.toString() ) );
					}

					done();
				} );
			} );
		} );

		it( 'should only contain the diff between the source and the rtl version', () => {
			const contentRrlCss = fs.readFileSync( rtlCssBundlePath, 'utf-8' ).replace( /\r/g, '' );
			const expected = fs
				.readFileSync( path.join( __dirname, 'rtl-diff-result.css' ), 'utf-8' )
				.replace( /\r/g, '' );
			expect( contentRrlCss ).toBe( expected );
		} );
	} );
} );
