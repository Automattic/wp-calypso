const path = require( 'path' );
const process = require( 'process' ); // eslint-disable-line
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
const outBasePath = process.env.STATS_PACKAGE_PATH ? process.env.STATS_PACKAGE_PATH : __dirname;
const outputPath = path.join( outBasePath, 'dist' );
const sourceMap = isDevelopment ? 'source-map' : false;

const defaultBrowserslistEnv = 'evergreen';
const browserslistEnv = process.env.BROWSERSLIST_ENV || defaultBrowserslistEnv;
const extraPath = browserslistEnv === 'defaults' ? 'fallback' : browserslistEnv;
const cachePath = path.resolve( '.cache', extraPath );

const excludedPackages = [
	/^calypso\/components\/inline-support-link$/,
	/^calypso\/my-sites\/stats\/mini-carousel.*$/,
	/^calypso\/blocks\/jetpack-backup-creds-banner.*$/,
	/^calypso\/components\/data\/query-keyring-connections$/,
	/^calypso\/components\/data\/query-jetpack-modules$/,
	/^calypso\/components\/data\/query-site-keyrings$/,
	/^calypso\/components\/data\/query-preferences$/,
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
		'widget-loader': path.join( __dirname, 'src', 'widget-loader' ),
	},
	mode: isDevelopment ? 'development' : 'production',
	devtool: sourceMap,
	output: {
		path: outputPath,
		filename: '[name].min.js',
		chunkFilename: '[name]-[contenthash].js?minify=false',
	},
	optimization: {
		minimize: ! isDevelopment,
		concatenateModules: ! shouldEmitStats,
		minimizer: Minify(),
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
				use: { loader: './filter-json-config-loader', options: { keys: [ 'features' ] } },
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
				base_dir: '../../',
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
			/^@automattic\/calypso-config$/,
			path.resolve( __dirname, 'src/lib/config-api' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/^calypso\/components\/jetpack-colophon$/,
			'calypso/components/jetpack/jetpack-footer'
		),
		new webpack.NormalModuleReplacementPlugin(
			/^calypso\/components\/formatted-header$/,
			( resource ) => {
				// Only replace for the navigation-header context
				if ( resource.context.includes( 'components/navigation-header' ) ) {
					resource.request = resource.request.replace(
						/^calypso\/components\/formatted-header$/,
						path.resolve( __dirname, 'src/components/odyssey-formatted-header' )
					);
				}
			}
		),
		new webpack.NormalModuleReplacementPlugin(
			/^calypso\/components\/data\/query-site-purchases$/,
			path.resolve( __dirname, 'src/components/odyssey-query-site-purchases' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/^calypso\/components\/data\/query-products-list$/,
			path.resolve( __dirname, 'src/components/odyssey-query-products' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/^calypso\/components\/data\/query-memberships$/,
			path.resolve( __dirname, 'src/components/odyssey-query-memberships' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/^..\/root-child$/,
			path.resolve( __dirname, 'src/components/root-child' )
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
