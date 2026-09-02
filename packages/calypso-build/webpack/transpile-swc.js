const browserslist = require( 'browserslist' );

/**
 * Return a webpack loader configuration object for JavaScript/TypeScript
 * transpilation using SWC. This is the successor to `./transpile` (Babel +
 * thread-loader): SWC transpiles natively on its own thread pool, so no
 * worker pool or on-disk transpilation cache is needed.
 * @param {Object} _                   Options
 * @param {string} _.browserslistEnv   Browserslist environment to resolve targets from (e.g. 'evergreen', 'server')
 * @param {string} _.importSource      JSX automatic-runtime import source (e.g. '@emotion/react')
 * @param {boolean} _.development      Enable development JSX transform output
 * @param {boolean} _.refresh          Enable the react-refresh transform (for HMR)
 * @param {boolean} _.unambiguous      Detect module type per-file, for dependencies that may be CommonJS
 * @param {RegExp|Function} _.exclude  Directories to exclude when looking for files to transpile
 * @param {RegExp|Function} _.include  Directories to include when looking for files to transpile
 * @returns {Object} Webpack loader object
 */
module.exports.loader = ( {
	browserslistEnv,
	importSource,
	development,
	refresh,
	unambiguous,
	exclude,
	include,
} ) => ( {
	test: /\.[jt]sx?$/,
	include,
	exclude,
	use: [
		{
			loader: require.resolve( './swc-loader' ),
			options: {
				targets: browserslist( null, { env: browserslistEnv, path: process.cwd() } ),
				coreJs: require( 'core-js/package.json' ).version,
				importSource,
				development,
				refresh,
				unambiguous,
			},
		},
	],
} );
