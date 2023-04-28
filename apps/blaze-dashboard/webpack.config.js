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
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const {
	defaultRequestToExternal,
	defaultRequestToHandle,
} = require( '@wordpress/dependency-extraction-webpack-plugin/lib/util' );
const autoprefixerPlugin = require( 'autoprefixer' );
const webpack = require( 'webpack' );
const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const cacheIdentifier = require( '../../build-tools/babel/babel-loader-cache-identifier' );
const GenerateChunksMapPlugin = require( '../../build-tools/webpack/generate-chunks-map-plugin' );

const shouldEmitStats = process.env.EMIT_STATS && process.env.EMIT_STATS !== 'false';
const isDevelopment = process.env.NODE_ENV !== 'production';
const outBasePath = process.env.BLAZE_DASHBOARD_PACKAGE_PATH
	? process.env.BLAZE_DASHBOARD_PACKAGE_PATH
	: __dirname;
const outputPath = path.join( outBasePath, 'dist' );

const defaultBrowserslistEnv = 'evergreen';
const browserslistEnv = process.env.BROWSERSLIST_ENV || defaultBrowserslistEnv;
const extraPath = browserslistEnv === 'defaults' ? 'fallback' : browserslistEnv;
const cachePath = path.resolve( '.cache', extraPath );

const excludedPackages = [
	/^calypso\/components\/inline-support-link$/,
	/^calypso\/components\/web-preview.*$/,
	/^calypso\/blocks\/upsell-nudge.*$/,
	/^calypso\/my-sites\/stats\/mini-carousel.*$/,
	/^calypso\/blocks\/jetpack-backup-creds-banner.*$/,
	/^calypso\/components\/data\/query-keyring-connections$/,
	/^calypso\/components\/data\/query-jetpack-modules$/,
	/^calypso\/components\/data\/query-site-keyrings$/,
];

const excludedPackagePlugins = excludedPackages.map(
	// Note: apparently the word "package" is a reserved keyword here for some reason
	( pkg ) =>
		new webpack.NormalModuleReplacementPlugin(
			pkg,
			path.resolve( __dirname, 'src/components/nothing' )
		)
);

module.exports = {
	bail: ! isDevelopment,
	entry: {
		build: path.join( __dirname, 'src', 'app' ),
	},
	mode: isDevelopment ? 'development' : 'production',
	devtool: false,
	output: {
		path: outputPath,
		filename: '[name].min.js',
		chunkFilename: '[contenthash].js',
	},
	optimization: {
		minimize: ! isDevelopment,
		concatenateModules: ! shouldEmitStats,
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
			{
				test: /.*config\/production\.json$/,
				use: {
					loader: './filter-json-config-loader',
					options: {
						keys: [ 'features', 'dsp_stripe_pub_key', 'dsp_widget_js_src' ],
					},
				},
			},
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
			filename: '[name].min.css',
			chunkFilename: '[contenthash].css',
			minify: ! isDevelopment,
		} ),
		new DependencyExtractionWebpackPlugin( {
			injectPolyfill: true,
			useDefaults: false,
			requestToHandle: defaultRequestToHandle,
			requestToExternal: ( request ) => {
				if (
					! [
						'lodash',
						'lodash-es',
						'react',
						'react-dom',
						'@wordpress/api-fetch',
						'@wordpress/components',
						'@wordpress/compose',
						'@wordpress/element',
						'@wordpress/html-entities',
						'@wordpress/i18n',
						'@wordpress/is-shallow-equal',
						'@wordpress/polyfill',
						'@wordpress/primitives',
						'@wordpress/url',
						'@wordpress/warning',
						'moment',
						'../moment',
					].includes( request )
				) {
					return;
				}
				// moment locales requires moment.js main file, so we need to handle it as an external as well.
				if ( request === '../moment' ) {
					request = 'moment';
				}
				return defaultRequestToExternal( request );
			},
		} ),
		! isDevelopment &&
			new GenerateChunksMapPlugin( {
				output: path.resolve( outBasePath, 'dist/chunks-map.json' ),
			} ),
		/*
		 * ExPlat: Don't import the server logger when we are in the browser
		 */
		new webpack.NormalModuleReplacementPlugin(
			/^calypso\/server\/lib\/logger$/,
			'calypso/lib/explat/internals/logger-browser-replacement'
		),
		new webpack.IgnorePlugin( { resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ } ),
		new ExtensiveLodashReplacementPlugin(),
		new InlineConstantExportsPlugin( /\/client\/state\/action-types.[tj]s$/ ),
		new InlineConstantExportsPlugin( /\/client\/state\/themes\/action-types.[tj]s$/ ),
		new webpack.NormalModuleReplacementPlugin( /^path$/, 'path-browserify' ),
		// Repalce the `packages/components/src/gridicon/index.tsx` with a replacement that does not enqueue the SVG sprite.
		// The sprite is loaded separately in Jetpack.
		new webpack.NormalModuleReplacementPlugin( /^\.\.\/gridicon$/, '../gridicon/no-asset' ),
		new webpack.NormalModuleReplacementPlugin( /^\.\/gridicon$/, './gridicon/no-asset' ),
		new webpack.NormalModuleReplacementPlugin(
			/^calypso\/components\/jetpack-colophon$/,
			'calypso/components/jetpack/jetpack-footer'
		),
		new webpack.NormalModuleReplacementPlugin(
			/^calypso\/components\/formatted-header$/,
			'calypso/components/jetpack/jetpack-header'
		),
		...excludedPackagePlugins,
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
};
