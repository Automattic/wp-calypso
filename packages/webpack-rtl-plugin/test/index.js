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
		new WebpackRTLPlugin( {
			minify: false,
		} ),
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

		beforeAll( ( done ) => {
			webpack( baseConfig, ( err, stats ) => {
				if ( err ) {
					return done( err );
				}

				if ( stats.hasErrors() ) {
					return done( new Error( stats.toString() ) );
				}
				done();
			} );
		} );

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

		beforeAll( ( done ) => {
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
						minify: false,
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
		} );

		it( 'should create a two css bundles', () => {
			expect( fs.existsSync( bundlePath ) ).toBe( true );
			expect( fs.existsSync( cssBundlePath ) ).toBe( true );
			expect( fs.existsSync( rtlCssBundlePath ) ).toBe( true );
		} );
	} );

	describe( 'Filename options', () => {
		let cssBundleName;
		let rtlCssBundleName;
		let cssBundlePath;
		let rtlCssBundlePath;

		beforeAll( ( done ) => {
			const config = {
				...baseConfig,
				output: {
					path: path.resolve( __dirname, 'dist-hash' ),
					filename: 'bundle.js',
				},
				plugins: [
					new MiniCssExtractPlugin( {
						filename: 'style.[contenthash].css',
					} ),
					new WebpackRTLPlugin( {
						filename: 'style.[contenthash].rtl.css',
						minify: false,
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

				Object.keys( stats.compilation.assets ).forEach( ( asset ) => {
					const chunk = asset.split( '.' );

					if ( path.extname( asset ) === '.css' ) {
						if ( chunk[ chunk.length - 2 ] === 'rtl' ) {
							rtlCssBundleName = asset;
							rtlCssBundlePath = path.join( __dirname, 'dist-hash', asset );
						} else {
							cssBundleName = asset;
							cssBundlePath = path.join( __dirname, 'dist-hash', asset );
						}
					}
				} );

				done();
			} );
		} );

		it( 'should create a two css bundles', () => {
			expect( fs.existsSync( cssBundlePath ) ).toBe( true );
			expect( fs.existsSync( rtlCssBundlePath ) ).toBe( true );
		} );

		it( 'should create a second bundle with a different hash', () => {
			const cssChunk = cssBundleName.split( '.' );
			const rtlCssChunk = rtlCssBundleName.split( '.' );

			expect( cssChunk[ 1 ] ).not.toEqual( rtlCssChunk[ 1 ] );
		} );
	} );

	describe( 'Filename options with patterns', () => {
		let cssBundleName;
		let rtlCssBundleName;
		let cssBundlePath;
		let rtlCssBundlePath;

		beforeAll( ( done ) => {
			const config = {
				...baseConfig,
				output: {
					path: path.resolve( __dirname, 'dist-patterns' ),
					filename: 'bundle.js',
				},
				plugins: [
					new MiniCssExtractPlugin( {
						filename: 'style.[contenthash].css',
					} ),
					new WebpackRTLPlugin( {
						filename: '[id]-[file]-[contenthash]-[name]-[filebase].rtl.[ext]',
						minify: false,
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

				Object.keys( stats.compilation.assets ).forEach( ( asset ) => {
					const chunk = asset.split( '.' );

					if ( path.extname( asset ) === '.css' ) {
						if ( chunk[ chunk.length - 2 ] === 'rtl' ) {
							rtlCssBundleName = asset;
							rtlCssBundlePath = path.join( __dirname, 'dist-patterns', asset );
						} else {
							cssBundleName = asset;
							cssBundlePath = path.join( __dirname, 'dist-patterns', asset );
						}
					}
				} );

				done();
			} );
		} );

		it( 'should create a two css bundles', () => {
			expect( fs.existsSync( cssBundlePath ) ).toBe( true );
			expect( fs.existsSync( rtlCssBundlePath ) ).toBe( true );
		} );

		it( 'should create a second bundle with a different hash', () => {
			const cssChunk = cssBundleName.split( '.' )[ 1 ];
			const rtlCssChunk = rtlCssBundleName.split( '-' )[ 2 ];

			expect( cssChunk ).not.toEqual( rtlCssChunk );
		} );
	} );

	describe( 'Filename options with replace array', () => {
		let cssBundlePath;
		let rtlCssBundlePath;

		beforeAll( ( done ) => {
			const config = {
				...baseConfig,
				output: {
					path: path.resolve( __dirname, 'dist-replace' ),
					filename: 'bundle.js',
				},
				plugins: [
					new MiniCssExtractPlugin( {
						filename: 'style.[contenthash].css',
					} ),
					new WebpackRTLPlugin( {
						filename: [ /(\.css)/, '-rtl$1' ],
						minify: false,
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

				Object.keys( stats.compilation.assets ).forEach( ( asset ) => {
					if ( path.extname( asset ) === '.css' ) {
						if ( asset.substr( -7, 3 ) === 'rtl' ) {
							rtlCssBundlePath = path.join( __dirname, 'dist-replace', asset );
						} else {
							cssBundlePath = path.join( __dirname, 'dist-replace', asset );
						}
					}
				} );

				done();
			} );
		} );

		it( 'should create a two css bundles', () => {
			expect( fs.existsSync( cssBundlePath ) ).toBe( true );
			expect( fs.existsSync( rtlCssBundlePath ) ).toBe( true );
		} );
	} );

	describe( 'Same path when no filename option', () => {
		let cssBundlePath;
		let rtlCssBundlePath;
		const cssPath = 'assets/css';

		beforeAll( ( done ) => {
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
		} );

		it( 'should create two css bundles with same path', () => {
			expect( fs.existsSync( cssBundlePath ) ).toBe( true );
			expect( fs.existsSync( rtlCssBundlePath ) ).toBe( true );
		} );
	} );

	describe( 'Rtlcss options', () => {
		const rtlCssBundlePath = path.join( __dirname, 'dist-options/style.rtl.css' );

		beforeAll( ( done ) => {
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
						minify: false,
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

		it( 'should follow the options given to rtlcss', () => {
			const contentRrlCss = fs.readFileSync( rtlCssBundlePath, 'utf-8' );
			expect( contentRrlCss ).toContain( '.next {' );
		} );
	} );

	describe( 'Rtlcss plugins', () => {
		const rtlCssBundlePath = path.join( __dirname, 'dist-options/style.rtl.css' );

		beforeAll( ( done ) => {
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
						minify: false,
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

		it( 'should follow the plugins given to rtlcss', () => {
			const contentRrlCss = fs.readFileSync( rtlCssBundlePath, 'utf-8' );
			expect( contentRrlCss ).toContain( 'brightest' );
		} );
	} );

	describe( 'Diff', () => {
		const rtlCssBundlePath = path.join( __dirname, 'dist-diff/style.rtl.css' );

		beforeAll( ( done ) => {
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
						minify: false,
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

		it( 'should only contain the diff between the source and the rtl version', () => {
			const contentRrlCss = fs.readFileSync( rtlCssBundlePath, 'utf-8' ).replace( /\r/g, '' );
			const expected = fs
				.readFileSync( path.join( __dirname, 'rtl-diff-result.css' ), 'utf-8' )
				.replace( /\r/g, '' );
			expect( contentRrlCss ).toEqual( expected );
		} );
	} );

	describe( 'Minify', () => {
		const rtlCssBundlePath = path.join( __dirname, 'dist-min/style.rtl.css' );

		beforeAll( ( done ) => {
			const config = {
				...baseConfig,
				output: {
					path: path.resolve( __dirname, 'dist-min' ),
					filename: 'bundle.js',
				},
				plugins: [
					new MiniCssExtractPlugin( {
						filename: 'style.css',
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

				done();
			} );
		} );

		it( 'should minify the css', () => {
			const contentRrlCss = fs.readFileSync( rtlCssBundlePath, 'utf-8' );
			const expected =
				'.foo{padding-right:10px}.bar{position:absolute;left:100px}.prev{width:10px}.foo .bar{height:10px}';
			expect( contentRrlCss ).toContain( expected );
		} );
	} );
} );
