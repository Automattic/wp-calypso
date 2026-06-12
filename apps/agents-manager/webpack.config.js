const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );
const CopyPlugin = require( 'copy-webpack-plugin' );
const webpack = require( 'webpack' );
const GenerateChunksMapPlugin = require( '../../build-tools/webpack/generate-chunks-map-plugin' );

const isDevelopment = process.env.NODE_ENV !== 'production';

function getIndividualConfig( options = {} ) {
	const { name, env, argv, injectPolyfill = true } = options;

	const outputPath = path.join( __dirname, 'dist' );
	const webpackConfig = getBaseWebpackConfig( env, argv );

	return {
		...webpackConfig,
		mode: isDevelopment ? 'development' : 'production',
		entry: { [ name ]: path.join( __dirname, name ) },
		output: {
			...webpackConfig.output,
			path: outputPath,
			filename: '[name].min.js',
			library: 'agentsManager',
		},
		module: {
			...webpackConfig.module,
			rules: [
				...( webpackConfig.module?.rules || [] ),
				// Handle image assets from image-studio package
				{
					test: /\.(webp|png|jpg|jpeg|gif|svg)$/i,
					include: /image-studio/,
					type: 'asset/resource',
					generator: {
						filename: 'images/[name].[contenthash:8][ext]',
					},
				},
				// Handle image assets from block-notes package
				{
					test: /\.(webp|png|jpg|jpeg|gif|svg)$/i,
					include: /block-notes/,
					type: 'asset/resource',
					generator: {
						filename: 'images/[name].[contenthash:8][ext]',
					},
				},
			],
		},
		optimization: {
			...webpackConfig.optimization,
			// disable module concatenation so that instances of `__()` are not renamed
			concatenateModules: false,
		},
		plugins: [
			...webpackConfig.plugins.filter(
				( plugin ) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
			),
			new webpack.DefinePlugin( {
				__i18n_text_domain__: JSON.stringify( 'default' ),
				'process.env.NODE_DEBUG': JSON.stringify( process.env.NODE_DEBUG || false ),
			} ),
			new GenerateChunksMapPlugin( {
				output: path.resolve( `./dist/chunks-map-${ name }.json` ),
			} ),
			new DependencyExtractionWebpackPlugin( {
				injectPolyfill,
				outputFilename: '[name].asset.json',
				outputFormat: 'json',
				requestToExternal( request ) {
					// The extraction logic will only extract a package if requestToExternal
					// explicitly returns undefined for the given request. Null
					// shortcuts the logic such that the package will be bundled.
					if ( request === '@wordpress/react-i18n' ) {
						return null;
					}
					// TODO: Remove this override when @wordpress/abilities ships with
					// WordPress core (expected in WP 7.0).
					// Bundle @wordpress/abilities into image-studio so it works on
					// self-hosted sites where the package isn't registered as a script.
					if (
						( name === 'image-studio' ||
							name === 'block-notes' ||
							name === 'jetpack-ai-sidebar' ) &&
						request === '@wordpress/abilities'
					) {
						return null;
					}
					// Bundle @wordpress/ui: neither WordPress core nor the Gutenberg
					// plugin registers a wp-ui script handle yet, and WP_Scripts
					// silently skips scripts with unregistered dependencies, so
					// externalizing it prevents the bundle from loading on
					// self-hosted sites.
					if ( request === '@wordpress/ui' ) {
						return null;
					}
				},
			} ),
			new ReadableJsAssetsWebpackPlugin(),
		],
	};
}

/**
 * Reader chat config — bundles all dependencies (no WP externals).
 *
 * Omits DependencyExtractionWebpackPlugin entirely so React, @wordpress/data,
 * and other WP packages are inlined. The resulting reader-chat.min.js is
 * self-contained and safe to load on the frontend (no WP script loader needed).
 * @param   {Object}  options                       options
 * @param   {Object}  options.env                   environment options
 * @param   {Object}  options.argv                  webpack CLI args
 * @returns {Object}                                webpack config
 */
function getReaderConfig( options = {} ) {
	const { env, argv } = options;
	const outputPath = path.join( __dirname, 'dist' );
	const webpackConfig = getBaseWebpackConfig( env, argv );

	return {
		...webpackConfig,
		mode: isDevelopment ? 'development' : 'production',
		entry: { 'reader-chat': path.join( __dirname, 'reader-chat.js' ) },
		output: {
			...webpackConfig.output,
			path: outputPath,
			filename: '[name].min.js',
			chunkLoadingGlobal: 'webpackChunkJetpackReaderChat',
			uniqueName: 'JetpackReaderChat',
		},
		module: {
			...webpackConfig.module,
			rules: [
				...( webpackConfig.module?.rules || [] ),
				{
					// P2/O2 expects window._ to remain Underscore.
					resource: require.resolve( 'lodash/lodash.js' ),
					use: path.join( __dirname, 'disable-lodash-amd-loader.js' ),
				},
			],
		},
		resolve: {
			...webpackConfig.resolve,
			alias: {
				...( webpackConfig.resolve?.alias || {} ),
				'../agent-history': path.join( __dirname, 'reader-chat-route-stub.js' ),
				'../support-guide': path.join( __dirname, 'reader-chat-route-stub.js' ),
				'../support-guides': path.join( __dirname, 'reader-chat-route-stub.js' ),
				'../zendesk-chat': path.join( __dirname, 'reader-chat-route-stub.js' ),
			},
		},
		optimization: {
			...webpackConfig.optimization,
			// Disable module concatenation so __() calls are not renamed.
			concatenateModules: false,
		},
		plugins: [
			// Strip the base config's DependencyExtractionWebpackPlugin — we want
			// everything bundled, not externalized.
			...webpackConfig.plugins.filter(
				( plugin ) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
			),
			new webpack.DefinePlugin( {
				__i18n_text_domain__: JSON.stringify( 'default' ),
				'process.env.NODE_DEBUG': JSON.stringify( process.env.NODE_DEBUG || false ),
			} ),
			new ReadableJsAssetsWebpackPlugin(),
			// Intentionally NO DependencyExtractionWebpackPlugin — all WP deps are bundled.
		],
	};
}

/* Arguments to this function replicate webpack's so this config can be used on the command line,
 * with individual options overridden by command line args.
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 * @see {@link https://webpack.js.org/api/cli/}
 * @param   {Object}  env                           environment options
 * @param   {string}  env.source                    plugin slugs, comma separated list
 * @param   {Object}  argv                          options map
 * @param   {string}  argv.entry                    entry path
 * @returns {Object}                                webpack config
 */
function getWebpackConfig( env = { source: '' }, argv = {} ) {
	env.WP = true;

	// Copy the ESM provider wrapper for jetpack-ai-sidebar to dist.
	// This file is pure ESM and doesn't need webpack processing — AM
	// loads it via dynamic import() at runtime.
	const copyEsmProviders = new CopyPlugin( {
		patterns: [
			{
				from: path.join( __dirname, 'jetpack-ai-sidebar.provider.mjs' ),
				to: path.join( __dirname, 'dist', 'jetpack-ai-sidebar.provider.mjs' ),
			},
		],
	} );

	const configs = [
		getIndividualConfig( { env, argv, name: 'agents-manager-gutenberg' } ),
		getIndividualConfig( { env, argv, name: 'agents-manager-wp-admin' } ),
		getIndividualConfig( { env, argv, name: 'image-studio' } ),
		getIndividualConfig( { env, argv, name: 'jetpack-ai-sidebar' } ),
		getIndividualConfig( { env, argv, name: 'agents-manager-gutenberg-disconnected' } ),
		getIndividualConfig( { env, argv, name: 'agents-manager-wp-admin-disconnected' } ),
		getIndividualConfig( { env, argv, name: 'agents-manager-ciab-disconnected' } ),
		getIndividualConfig( { env, argv, name: 'block-notes' } ),
		getIndividualConfig( { env, argv, name: 'agents-manager-ciab' } ),
		getIndividualConfig( { env, argv, name: 'agents-manager-wooai' } ),
		getReaderConfig( { env, argv } ),
	];

	// Attach the copy plugin to the first config.
	configs[ 0 ].plugins.push( copyEsmProviders );

	return configs;
}

module.exports = getWebpackConfig;
