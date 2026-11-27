const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );
const webpack = require( 'webpack' );

const isDevelopment = process.env.NODE_ENV !== 'production';

/* Arguments to this function replicate webpack's so this config can be used on the command line,
 * with individual options overridden by command line args.
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 * @param   {Object}  env   environment options
 * @param   {Object}  argv  options map
 * @returns {Object}        webpack config
 */
function getWebpackConfig( env = { source: '' }, argv = {} ) {
	env.WP = true;

	const webpackConfig = getBaseWebpackConfig( env, argv );
	let safeHtmlReplaced = 0;

	return {
		...webpackConfig,
		mode: isDevelopment ? 'development' : 'production',
		entry: {
			'mcp-post-editor': path.join( __dirname, 'index.ts' ),
			// The title suggestions card in the chat: ext-apps and plain DOM only. About 526 KB
			// minified, nearly all ext-apps' bundled dependencies (zod, the MCP client).
			'mcp-post-editor-titles': path.join( __dirname, 'titles/index.ts' ),
		},
		output: {
			...webpackConfig.output,
			path: path.join( __dirname, 'dist' ),
			filename: '[name].min.js',
			chunkFilename: '[id].[contenthash:8].min.js',
		},
		plugins: [
			// The base config's extraction plugin writes a PHP asset file; wpcom reads
			// `version` from the JSON `mcp-post-editor.asset.json`.
			...webpackConfig.plugins.filter(
				( plugin ) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
			),
			// The page runs in an MCP host's sandboxed iframe, with no WordPress
			// scripts, so every dependency is bundled and the manifest lists none.
			new DependencyExtractionWebpackPlugin( {
				injectPolyfill: false,
				outputFilename: '[name].asset.json',
				outputFormat: 'json',
				useDefaults: false,
			} ),
			new ReadableJsAssetsWebpackPlugin(),
			// Each shell loads only its entry script, and an async chunk would load from the host's
			// origin, not widgets.wp.com, so everything goes in the entry. Entry chunks never merge.
			new webpack.optimize.LimitChunkCountPlugin( { maxChunks: 1 } ),
			// Client-side image processing (about 17 MB of WebAssembly), loaded only on upload,
			// which the editor doesn't offer.
			new webpack.IgnorePlugin( { resourceRegExp: /^@wordpress\/vips\/worker$/ } ),
			// The editor renders raw HTML (Custom HTML, unknown and invalid blocks) through
			// safeHTML, in this document: see editor/sanitize.ts.
			new webpack.NormalModuleReplacementPlugin( /^\.\/safe-html\.mjs$/, ( resource ) => {
				if ( /@wordpress[\\/]dom[\\/]/.test( resource.context ) ) {
					resource.request = path.join( __dirname, 'editor/sanitize.ts' );
					safeHtmlReplaced++;
				}
			} ),
			// Fails the build if @wordpress/dom renamed the file and the replacement matched nothing.
			{
				apply: ( compiler ) =>
					compiler.hooks.afterCompile.tap( 'SafeHtmlReplaced', ( compilation ) => {
						// Child compilers (one per style.scss) inherit this tap and can run first.
						if ( compilation.compiler.isChild() ) {
							return;
						}
						if ( ! safeHtmlReplaced ) {
							compilation.errors.push(
								new webpack.WebpackError( "@wordpress/dom's safe-html.mjs wasn't replaced" )
							);
						}
					} ),
			},
		],
	};
}

module.exports = getWebpackConfig;
