const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const webpack = require( 'webpack' );

/**
 * Consolidated stub that replaces all unused heavy modules.
 */
const stubModule = path.join( __dirname, 'src', 'stubs', 'index.js' );

/**
 * Modules to stub out for bundle size reduction.
 * These are transitive dependencies not needed for the comment editor.
 */
const modulesToStub = [
	// Collaborative editing (~500KB with yjs/lib0/simple-peer)
	/^@wordpress\/sync$/,

	// Date/time functionality (~2.5MB total with date-fns, moment-timezone)
	/^@wordpress\/date$/,
	/^date-fns/,
	/^@date-fns\/tz/,
	/^react-day-picker/,
	/@wordpress\/components\/build-module\/date-time(?:$|\/)/,
	/@wordpress\/components\/build-module\/calendar(?:$|\/)/,
	/@wordpress\/block-editor\/build-module\/components\/date-format-picker(?:$|\/)/,
	/@wordpress\/block-editor\/build-module\/components\/publish-date-time-picker(?:$|\/)/,

	// Command palette (~33KB)
	/^@wordpress\/commands$/,

	// Unused @wordpress/components (~250KB total)
	/@wordpress\/components\/build-module\/navigation(?:$|\/)/,
	/@wordpress\/components\/build-module\/focal-point-picker(?:$|\/)/,
	/@wordpress\/components\/build-module\/color-picker(?:$|\/)/,
	/@wordpress\/components\/build-module\/palette-edit(?:$|\/)/,

	// Other unused libraries
	/^showdown$/, // Markdown parser (~156KB)
	/^react-easy-crop$/, // Image cropping (~46KB)
];

function getWebpackConfig( env = { source: '' }, argv = {} ) {
	const outputPath = path.join( __dirname, 'dist' );
	const webpackConfig = getBaseWebpackConfig( env, argv );

	return {
		...webpackConfig,
		mode: 'production',
		entry: {
			'block-editor': path.join( __dirname, 'src', 'index.ts' ),
		},
		output: {
			...webpackConfig.output,
			path: outputPath,
			filename: '[name].min.js',
			library: 'verbumBlockEditor',
		},
		externals: {
			'@wordpress/i18n': [ 'wp', 'i18n' ],
		},
		plugins: [
			...webpackConfig.plugins,
			new webpack.DefinePlugin( {
				'process.env.IS_GUTENBERG_PLUGIN': true,
			} ),

			// Ignore moment.js locales
			new webpack.IgnorePlugin( {
				resourceRegExp: /^\.\/locale$/,
				contextRegExp: /moment$/,
			} ),

			// Replace all stubbed modules with consolidated stub
			...modulesToStub.map(
				( pattern ) => new webpack.NormalModuleReplacementPlugin( pattern, stubModule )
			),
		],
	};
}

module.exports = getWebpackConfig;
