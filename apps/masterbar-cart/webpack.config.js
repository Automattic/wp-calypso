const path = require( 'path' );
const process = require( 'process' ); // eslint-disable-line
const FileConfig = require( '@automattic/calypso-build/webpack/file-loader' );
const Minify = require( '@automattic/calypso-build/webpack/minify' );
const SassConfig = require( '@automattic/calypso-build/webpack/sass' );
const TranspileConfig = require( '@automattic/calypso-build/webpack/transpile' );
const { shouldTranspileDependency } = require( '@automattic/calypso-build/webpack/util' );
const autoprefixerPlugin = require( 'autoprefixer' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const webpack = require( 'webpack' );
const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );

const shouldEmitStats = process.env.EMIT_STATS && process.env.EMIT_STATS !== 'false';
const isDevelopment = process.env.NODE_ENV !== 'production';
const outputPath = path.join( __dirname, 'dist' );

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
				exclude: /node_modules\//,
				presets: [ require.resolve( '@automattic/calypso-build/babel/default' ) ],
			} ),
			TranspileConfig.loader( {
				include: shouldTranspileDependency,
				presets: [ require.resolve( '@automattic/calypso-build/babel/dependencies' ) ],
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
	},
	node: false,
	plugins: [
		new webpack.DefinePlugin( {
			'process.env.NODE_ENV': JSON.stringify( process.env.NODE_ENV ),
			'process.env.NODE_DEBUG': JSON.stringify( process.env.NODE_DEBUG || false ),
			'process.env.GUTENBERG_PHASE': JSON.stringify( 1 ),
			'process.env.COMPONENT_SYSTEM_PHASE': JSON.stringify( 0 ),
			'process.env.FORCE_REDUCED_MOTION': JSON.stringify(
				!! process.env.FORCE_REDUCED_MOTION || false
			),
			__i18n_text_domain__: JSON.stringify( 'default' ),
			global: 'window',
		} ),
		// Node polyfills
		new webpack.ProvidePlugin( {
			process: 'process/browser.js',
		} ),
		...SassConfig.plugins( {
			filename: 'build.min.css',
			minify: ! isDevelopment,
		} ),
		new HtmlWebpackPlugin( {
			filename: path.join( outputPath, 'index.html' ),
			template: path.join( __dirname, 'src', 'index.ejs' ),
			title: 'Masterbar Cart',
			hash: true,
			inject: false,
			isRTL: false,
		} ),
		new webpack.IgnorePlugin( { resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ } ),
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
