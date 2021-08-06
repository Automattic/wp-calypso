/* eslint-disable import/no-nodejs-modules */

const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config' );
const FileConfig = require( '@automattic/calypso-build/webpack/file-loader' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const webpack = require( 'webpack' );

// Modify this list to add new entrypoints.
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

const ETK_MODULE_PREFIX = 'a8c-fse';
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Generates a webpack entry object to accomplish the following goal:
 *
 * Given a path to a source entry (`package-dir/example/entryname`), resolve the
 * entry: `package-dir/example/entryname.(j|t)sx?` or `package-dir/example/entryname/index.(j|t)sx?`.
 * Then, place the entry output at `package-dir/dist/entryname.(js|css|asset.php|rtl.css)`.
 *
 * @param {Array<string>} entries A list of paths to entrypoints relative to ./editing-toolkit-plugin.
 * @returns {Object} The webpack entry object.
 */
function generateEntry( entries ) {
	return entries.reduce( ( acc, entry ) => {
		// If the source is 'test-package/foo/my-feat', the containing package is "test-package", and the entry name is "my-feat".
		const entrySegments = entry.split( path.sep );
		const entryName = entrySegments[ entrySegments.length - 1 ];
		const packageName = entrySegments[ 0 ];

		// The path to the output must be in the entry name or webpack will output
		// to the wrong directory.
		const entryOutput = `${ packageName }/dist/${ entryName }`;

		if ( acc[ entryOutput ] ) {
			throw new Error( `The entry ${ entryOutput } has already been defined.` );
		}

		acc[ entryOutput ] = {
			import: `./editing-toolkit-plugin/${ entry }`,
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
			path: path.join( __dirname, 'editing-toolkit-plugin' ),
		},
		entry: generateEntry( ETK_ENTRYPOINTS ),
		module: {
			...webpackConfig.module,
			rules: [
				// Remove the default asset loader.
				...webpackConfig.module.rules.filter( ( rule ) => rule.type !== 'asset/resource' ),
				// Add our own asset loader, placing images in a more appropriate location.
				FileConfig.loader( {
					outputPath: 'dist/images',
				} ),
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
				__i18n_text_domain__: JSON.stringify( 'full-site-editing' ),
			} ),
			new DependencyExtractionWebpackPlugin( {
				injectPolyfill: true,
				requestToExternal( request ) {
					if ( request.startsWith( ETK_MODULE_PREFIX ) ) {
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

	return config;
}

module.exports = getWebpackConfig;
