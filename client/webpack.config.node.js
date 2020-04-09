/**
 * **** WARNING: No ES6 modules here. Not transpiled! ****
 */

/* eslint import/no-extraneous-dependencies: [ "error", { packageDir: __dirname/.. } ] */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const path = require( 'path' );
const webpack = require( 'webpack' );

/**
 * Internal dependencies
 */
const cacheIdentifier = require( './server/bundler/babel/babel-loader-cache-identifier' );
const config = require( './server/config' );
const bundleEnv = config( 'env' );
const { workerCount } = require( './webpack.common' );
const TranspileConfig = require( '@automattic/calypso-build/webpack/transpile' );
const nodeExternals = require( 'webpack-node-externals' );
const FileConfig = require( '@automattic/calypso-build/webpack/file-loader' );

/**
 * Internal variables
 */
const isDevelopment = bundleEnv === 'development';
const devTarget = process.env.DEV_TARGET || 'evergreen';

const fileLoader = FileConfig.loader( {
	publicPath: isDevelopment ? `/calypso/${ devTarget }/images/` : '/calypso/images/',
	emitFile: false, // On the server side, don't actually copy files
} );

const commitSha = process.env.hasOwnProperty( 'COMMIT_SHA' ) ? process.env.COMMIT_SHA : '(unknown)';

/**
 * This lists modules that must use commonJS `require()`s
 * All modules listed here need to be ES5.
 *
 * @returns {Array} list of externals
 */
function getExternals() {
	return [
		// Don't bundle any node_modules, both to avoid a massive bundle, and problems
		// with modules that are incompatible with webpack bundling.
		//
		nodeExternals( {
			whitelist: [
				// `@automattic/components` is forced to be webpack-ed because it has SCSS and other
				// non-JS asset imports that couldn't be processed by Node.js at runtime.
				'@automattic/components',

				// Ensure that file-loader files imported from packages in node_modules are
				// _not_ externalized and can be processed by the fileLoader.
				fileLoader.test,
			],
		} ),
		// Some imports should be resolved to runtime `require()` calls, with paths relative
		// to the path of the `build/bundle.js` bundle.
		{
			// Don't bundle webpack.config, as it depends on absolute paths (__dirname)
			'webpack.config': {
				commonjs: '../client/webpack.config.js',
			},
			// Exclude the devdocs search-index, as it's huge.
			'server/devdocs/search-index': {
				commonjs: '../client/server/devdocs/search-index.js',
			},
		},
	];
}

const buildDir = path.resolve( 'build' );

const webpackConfig = {
	devtool: 'source-map',
	entry: path.join( __dirname, 'server' ),
	target: 'node',
	output: {
		path: buildDir,
		filename: 'bundle.js',
	},
	mode: isDevelopment ? 'development' : 'production',
	optimization: { minimize: false },
	module: {
		rules: [
			{
				include: path.join( __dirname, 'sections.js' ),
				use: {
					loader: path.join( __dirname, 'server', 'bundler', 'sections-loader' ),
					options: { forceRequire: true, onlyIsomorphic: true },
				},
			},
			TranspileConfig.loader( {
				workerCount,
				configFile: path.resolve( 'babel.config.js' ),
				cacheDirectory: path.join( buildDir, '.babel-server-cache' ),
				cacheIdentifier,
				exclude: /node_modules\//,
			} ),
			fileLoader,
			{
				test: /\.(sc|sa|c)ss$/,
				loader: 'ignore-loader',
			},
		],
	},
	resolve: {
		extensions: [ '.json', '.js', '.jsx', '.ts', '.tsx' ],
		modules: [ __dirname, path.join( __dirname, 'extensions' ), 'node_modules' ],
		alias: {
			config: 'server/config',
		},
	},
	node: {
		// Tell webpack we want to supply absolute paths for server code,
		// specifically needed by the client code bundler.
		__filename: true,
		__dirname: true,
	},
	plugins: [
		// Require source-map-support at the top, so we get source maps for the bundle
		new webpack.BannerPlugin( {
			banner: 'require( "source-map-support" ).install();',
			raw: true,
			entryOnly: false,
		} ),
		new webpack.ExternalsPlugin( 'commonjs', getExternals() ),
		new webpack.DefinePlugin( {
			BUILD_TIMESTAMP: JSON.stringify( new Date().toISOString() ),
			COMMIT_SHA: JSON.stringify( commitSha ),
			'process.env.NODE_ENV': JSON.stringify( bundleEnv ),
		} ),
		new webpack.NormalModuleReplacementPlugin( /^lib[/\\]abtest$/, 'lodash/noop' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin( /^lib[/\\]analytics$/, 'lodash/noop' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin( /^lib[/\\]user$/, 'lodash/noop' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin(
			/^my-sites[/\\]themes[/\\]theme-upload$/,
			'components/empty-component'
		), // Depends on BOM
	].filter( Boolean ),
};

if ( ! config.isEnabled( 'desktop' ) ) {
	webpackConfig.plugins.push(
		new webpack.NormalModuleReplacementPlugin( /^lib[/\\]desktop$/, 'lodash/noop' )
	);
}

module.exports = webpackConfig;
