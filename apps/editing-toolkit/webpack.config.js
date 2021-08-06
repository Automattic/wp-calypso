/**
 * WARNING: No ES6 modules here. Not transpiled! *
 */
/* eslint-disable import/no-nodejs-modules */

const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const webpack = require( 'webpack' );

const FSE_MODULE_PREFIX = 'a8c-fse';

/**
 * Internal variables
 */
const isDevelopment = process.env.NODE_ENV !== 'production';

const ETK_ENTRYPOINTS = [
	'dotcom-fse',
	'posts-list-block',
	'common/hide-plugin-buttons-mobile',
	'common/data-stores',
	'common',
	'editor-site-launch/launch-button',
	'editor-site-launch/gutenboarding-launch',
	'editor-site-launch/focused-launch',
	'error-reporting',
	'newspack-blocks/blog-posts-block-editor',
	'newspack-blocks/blog-posts-block-view',
	'newspack-blocks/carousel-block-editor',
	'newspack-blocks/carousel-block-view',
	'starter-page-templates',
	'event-countdown-block',
	'global-styles',
	'global-styles/customizer-fonts',
	'jetpack-timeline',
	'wpcom-block-editor-nux',
	'block-inserter-modifications/contextual-tips',
	'wpcom-block-editor-nav-sidebar',
	'whats-new',
];

/**
 * Generates the webpack entry object.
 *
 * @param {Array<string>} entries A list of paths to entrypoints.
 */
function generateEntry( entries ) {
	return entries.reduce( ( acc, source ) => {
		// If the source is 'test-package/foo/my-feat', the containing package is "test-package" and the scriptname is "my-feat".
		// This will resolve "scriptname.(j|t)s(x)" or "scriptname/index(j|t)s(x)"
		const sourceSegments = source.split( path.sep );
		const scriptName =
			sourceSegments.length > 1 ? sourceSegments.slice( sourceSegments.length - 1 ) : source;
		// The containing package.
		const packageName = sourceSegments[ 0 ];
		const bundleLocation = `editing-toolkit-plugin/${ packageName }/dist/${ scriptName }`;

		if ( acc[ bundleLocation ] ) {
			throw new Error( 'The bundle ' + bundleLocation + ' has already been defined.' );
		}
		acc[ bundleLocation ] = {
			import: `./editing-toolkit-plugin/${ source }`,
			filename: '[name].js',
		};

		return acc;
	}, {} );
}

/**
 * Return a webpack config object
 *
 * Arguments to this function replicate webpack's so this config can be used on the command line,
 * with individual options overridden by command line args.
 *
 * @see {@link https://webpack.org/configuration/configuration-types/#exporting-a-function}
 * @see {@link https://webpack.org/api/cli/}
 * @param   {object}  env                           environment options
 * @param   {string}  env.source                    plugin slugs, comma separated list
 * @param   {object}  argv                          options map
 * @param   {string}  argv.entry                    entry path
 * @returns {object}                                webpack config
 */
function getWebpackConfig( env = { source: '' }, argv = {} ) {
	env.WP = true;

	const webpackConfig = getBaseWebpackConfig( env, argv );

	const config = {
		...webpackConfig,
		output: {
			library: 'EditingToolkit',
			path: __dirname,
		},
		entry: generateEntry( ETK_ENTRYPOINTS ),
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
				__i18n_text_domain__: JSON.stringify( 'full-site-editing' ),
			} ),
			new DependencyExtractionWebpackPlugin( {
				injectPolyfill: true,
				requestToExternal( request ) {
					if ( request.startsWith( FSE_MODULE_PREFIX ) ) {
						switch ( request ) {
							// This is not a real module, it is a placeholder that corresponds to a WordPress script handle registered with the same name.
							// This allows us to import the module, declaring the dependency via JavaScript.
							// A TypeScript type helps ensure it's used properly. See `./typings/fse`
							case 'a8c-fse-common-data-stores':
								return request;

							default:
								throw new Error( `Received unknown module request ${ request }.` );
						}
					}
				},
			} ),
		],
		watch: isDevelopment,
		devtool: isDevelopment ? 'inline-cheap-source-map' : false,
		stats: 'minimal',
	};

	console.log( config );
	return config;
}

module.exports = getWebpackConfig;
