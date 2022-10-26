const path = require( 'path' );
const process = require( 'process' ); // eslint-disable-line
const BuildMetaPlugin = require( '@automattic/calypso-apps-builder/build-meta-webpack-plugin.cjs' );
const FileConfig = require( '@automattic/calypso-build/webpack/file-loader' );
const Minify = require( '@automattic/calypso-build/webpack/minify' );
const SassConfig = require( '@automattic/calypso-build/webpack/sass' );
const TranspileConfig = require( '@automattic/calypso-build/webpack/transpile' );
const { shouldTranspileDependency } = require( '@automattic/calypso-build/webpack/util' );
const ExtensiveLodashReplacementPlugin = require( '@automattic/webpack-extensive-lodash-replacement-plugin' );
const InlineConstantExportsPlugin = require( '@automattic/webpack-inline-constant-exports-plugin' );
const autoprefixerPlugin = require( 'autoprefixer' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const webpack = require( 'webpack' );
const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const cacheIdentifier = require( '../../build-tools/babel/babel-loader-cache-identifier' );

const shouldEmitStats = process.env.EMIT_STATS && process.env.EMIT_STATS !== 'false';
const isDevelopment = process.env.NODE_ENV !== 'production';
const outputPath = path.join( __dirname, 'dist' );

const defaultBrowserslistEnv = 'evergreen';
const browserslistEnv = process.env.BROWSERSLIST_ENV || defaultBrowserslistEnv;
const extraPath = browserslistEnv === 'defaults' ? 'fallback' : browserslistEnv;
const cachePath = path.resolve( '.cache', extraPath );

module.exports = {
	bail: ! isDevelopment,
	entry: path.join( __dirname, 'src', 'app' ),
	mode: isDevelopment ? 'development' : 'production',
	devtool: false,
	output: {
		path: outputPath,
		filename: 'build.min.js',
	},
	optimization: {
		minimize: ! isDevelopment,
		minimizer: Minify( {
			extractComments: false,
			terserOptions: {
				ecma: 5,
				safari10: true,
				mangle: { reserved: [ '__', '_n', '_nx', '_x' ] },
			},
		} ),
		splitChunks: false,
	},
	module: {
		strictExportPresence: true,
		rules: [
			TranspileConfig.loader( {
				workerCount: 2,
				configFile: path.resolve( '../../babel.config.js' ),
				cacheDirectory: path.resolve( cachePath, 'babel-client' ),
				cacheIdentifier,
				cacheCompression: false,
				exclude: /node_modules\//,
			} ),
			TranspileConfig.loader( {
				workerCount: 2,
				presets: [ require.resolve( '@automattic/calypso-babel-config/presets/dependencies' ) ],
				cacheDirectory: path.resolve( cachePath, 'babel-client' ),
				cacheIdentifier,
				cacheCompression: false,
				include: shouldTranspileDependency,
			} ),
			SassConfig.loader( {
				includePaths: [ __dirname ],
				postCssOptions: {
					// Do not use postcss.config.js. This ensure we have the final say on how PostCSS is used in calypso.
					// This is required because Calypso imports `@automattic/notifications` and that package defines its
					// own `postcss.config.js` that they use for their webpack bundling process.
					config: false,
					plugins: [ autoprefixerPlugin() ],
				},
				prelude: `@use '${ require.resolve(
					'calypso/assets/stylesheets/shared/_utils.scss'
				) }' as *;`,
			} ),
			FileConfig.loader(),
		],
	},
	resolve: {
		extensions: [ '.json', '.js', '.jsx', '.ts', '.tsx' ],
		mainFields: [ 'browser', 'calypso:src', 'module', 'main' ],
		conditionNames: [ 'calypso:src', 'import', 'module', 'require' ],
	},
	node: false,
	plugins: [
		BuildMetaPlugin( { outputPath } ),
		new webpack.DefinePlugin( {
			global: 'window',
			'process.env.NODE_DEBUG': JSON.stringify( process.env.NODE_DEBUG || false ),
		} ),
		...SassConfig.plugins( {
			filename: 'build.min.css',
			minify: ! isDevelopment,
		} ),
		/*
		 * ExPlat: Don't import the server logger when we are in the browser
		 */
		new webpack.NormalModuleReplacementPlugin(
			/^calypso\/server\/lib\/logger$/,
			'calypso/lib/explat/internals/logger-browser-replacement'
		),
		new HtmlWebpackPlugin( {
			filename: path.join( outputPath, 'index.html' ),
			template: path.join( __dirname, 'src', 'index.ejs' ),
			title: 'Stats',
			hash: true,
			inject: false,
			isRTL: false,
		} ),
		new webpack.IgnorePlugin( { resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ } ),
		new ExtensiveLodashReplacementPlugin(),
		new InlineConstantExportsPlugin( /\/client\/state\/action-types.js$/ ),
		new webpack.NormalModuleReplacementPlugin( /^path$/, 'path-browserify' ),
		shouldEmitStats &&
			new BundleAnalyzerPlugin( {
				analyzerMode: 'server',
				statsOptions: {
					source: false,
					reasons: false,
					optimizationBailout: false,
					chunkOrigins: false,
					chunkGroups: true,
				},
			} ),
	].filter( Boolean ),
	devServer: {
		host: 'calypso.localhost',
		port: 3000,
		static: {
			directory: path.join( __dirname, 'dist' ),
		},
		client: {
			progress: true,
		},
		watchFiles: [ 'dist/**/*' ],
	},
};
