/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const _ = require( 'lodash' );
const FileConfig = require( '@automattic/calypso-build/webpack/file-loader' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const path = require( 'path' );
const SassConfig = require( '@automattic/calypso-build/webpack/sass' );
const TranspileConfig = require( '@automattic/calypso-build/webpack/transpile' );

/**
 * Internal variables
 */
const cacheIdentifier = require( '../../server/bundler/babel/babel-loader-cache-identifier' );
const isDevelopment = process.env.NODE_ENV !== 'production';

const nodeModulesToTranspile = [
	// general form is <package-name>/.
	// The trailing slash makes sure we're not matching these as prefixes
	// In some cases we do want prefix style matching (lodash. for lodash.assign)
	'@github/webauthn-json/',
	'acorn-jsx/',
	'chalk/',
	'd3-array/',
	'd3-scale/',
	'debug/',
	'escape-string-regexp/',
	'filesize/',
	'prismjs/',
	'react-spring/',
	'regenerate-unicode-properties/',
	'regexpu-core/',
	'striptags/',
	'unicode-match-property-ecmascript/',
	'unicode-match-property-value-ecmascript/',
];

/**
 * Check to see if we should transpile certain files in node_modules
 *
 * @param {string} filepath the path of the file to check
 * @returns {boolean} True if we should transpile it, false if not
 *
 * We had a thought to try to find the package.json and use the engines property
 * to determine what we should transpile, but not all libraries set engines properly
 * (see d3-array@2.0.0). Instead, we transpile libraries we know to have dropped Node 4 support
 * are likely to remain so going forward.
 */
function shouldTranspileDependency( filepath ) {
	// find the last index of node_modules and check from there
	// we want <working>/node_modules/a-package/node_modules/foo/index.js to only match foo, not a-package
	const marker = '/node_modules/';
	const lastIndex = filepath.lastIndexOf( marker );
	if ( lastIndex === -1 ) {
		// we're not in node_modules
		return false;
	}

	const checkFrom = lastIndex + marker.length;

	return _.some(
		nodeModulesToTranspile,
		modulePart => filepath.substring( checkFrom, checkFrom + modulePart.length ) === modulePart
	);
}

/**
 * Return a webpack config object
 *
 * Arguments to this function replicate webpack's so this config can be used on the command line,
 * with individual options overridden by command line args.
 *
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 * @see {@link https://webpack.js.org/api/cli/}
 *
 * @param   {object}  env                           environment options
 * @param   {object}  argv                          options map
 * @param   {object}  argv.entry                    Entry point(s)
 * @param   {string}  argv.'output-path'            Output path
 * @param   {string}  argv.'output-filename'        Output filename pattern
 * @param   {string}  argv.'output-library-target'  Output library target
 * @returns {object}                                webpack config
 */
function getWebpackConfig(
	env = {},
	{
		entry = {
			default: path.join( __dirname, 'src', 'index' ),
		},
		'output-path': outputPath = path.join( __dirname, 'dist' ),
		'output-filename': outputFilename = isDevelopment ? '[name].js' : '[name].min.js',
	}
) {
	const webpackConfig = getBaseWebpackConfig( env, {
		entry,
		'output-filename': outputFilename,
		'output-path': outputPath,
	} );
	const rootDir = path.dirname( path.dirname( __dirname ) );

	return {
		...webpackConfig,
		watch: isDevelopment,
		devtool: isDevelopment ? 'inline-cheap-source-map' : false,
		resolve: {
			...webpackConfig.resolve,
			modules: [ ...webpackConfig.resolve.modules, path.join( rootDir, 'client' ) ],
		},
		module: {
			rules: [
				TranspileConfig.loader( {
					workerCount: 1,
					configFile: path.join( rootDir, 'babel.config.js' ),
					cacheDirectory: path.join( rootDir, 'build', '.babel-client-cache', 'defaults' ),
					cacheIdentifier,
					exclude: /node_modules\//,
				} ),
				TranspileConfig.loader( {
					workerCount: 1,
					configFile: path.resolve( rootDir, 'babel.dependencies.config.js' ),
					cacheDirectory: path.join( rootDir, 'build', '.babel-client-cache', 'defaults' ),
					cacheIdentifier,
					include: shouldTranspileDependency,
				} ),
				FileConfig.loader(),
				SassConfig.loader( {
					includePaths: [ path.join( rootDir, 'client' ) ],
					prelude: `@import '${ path.join(
						rootDir,
						'client/assets/stylesheets/shared/_utils.scss'
					) }';`,
					postCssConfig: { path: __dirname },
				} ),
			],
		},
		externals: [ 'electron' ],
		node: {
			fs: 'empty',
		},
		stats: 'minimal',
	};
}

module.exports = getWebpackConfig;
