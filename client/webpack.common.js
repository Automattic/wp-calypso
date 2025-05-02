const { cpus } = require( 'os' );
const path = require( 'path' );
const SassConfig = require( '@automattic/calypso-build/webpack/sass' );
const { cssNameFromFilename } = require( '@automattic/calypso-build/webpack/util' );
const autoprefixerPlugin = require( 'autoprefixer' );

/**
 * Get an env var that should be a positive integer greater than 0
 * @param {string} envVarName   Environment variable name
 * @param {number} defaultValue Fallback in case env variable isn't present or invalid
 * @returns {number} Value
 */
function getEnvVarAsNaturalNumber( envVarName, defaultValue ) {
	if ( typeof envVarName !== 'string' ) {
		throw new TypeError( 'Expected string environment variable name' );
	}
	if ( typeof defaultValue !== 'number' ) {
		throw new TypeError( 'Expected number defaultValue' );
	}

	if ( process.env[ envVarName ] && ! Number.isNaN( parseInt( process.env[ envVarName ], 10 ) ) ) {
		return Math.max( 1, parseInt( process.env[ envVarName ], 10 ) );
	}
	return defaultValue;
}

let workerCount;
if ( process.env.CIRCLECI ) {
	workerCount = 2;
} else {
	workerCount = getEnvVarAsNaturalNumber(
		'WORKERS',
		Math.min( Math.max( cpus().length - 1, 2 ), 32 )
	);
}

const concurrentBuilds = getEnvVarAsNaturalNumber( 'CONCURRENT_BUILDS', 1 );
if ( concurrentBuilds > 1 ) {
	workerCount = Math.max( 1, Math.floor( workerCount / concurrentBuilds ) );
}

const getOutputFileName = ( { isDevelopment } ) => {
	let outputFilename = '[name].[contenthash].min.js';
	let outputChunkFilename = '[name].[contenthash].min.js';

	// we should not use chunkhash in development: https://github.com/webpack/webpack-dev-server/issues/377#issuecomment-241258405
	// also we don't minify so dont name them .min.js
	if ( isDevelopment ) {
		outputFilename = '[name].js';
		outputChunkFilename = '[name].js';
	}

	return {
		outputFilename,
		outputChunkFilename,
	};
};

const getSCSSConfig = ( { outputFilename, outputChunkFilename } ) => {
	const cssFilename = cssNameFromFilename( outputFilename );
	const cssChunkFilename = cssNameFromFilename( outputChunkFilename );

	const loader = SassConfig.loader( {
		includePaths: [ __dirname ],
		postCssOptions: {
			// Do not use postcss.config.js. This ensure we have the final say on how PostCSS is used in calypso.
			// This is required because Calypso imports `@automattic/notifications` and that package defines its
			// own `postcss.config.js` that they use for their webpack bundling process.
			config: false,
			plugins: [ autoprefixerPlugin() ],
		},
		// Since `prelude` string will be appended to each Sass file
		// We need to ensure that the import path (inside a sass file) is a posix path, regardless of the OS/platform
		// Final result should be something like `@use 'client/assets/stylesheets/shared/_utils.scss' as *;`
		prelude: `@use '${
			path
				// Path, relative to Node CWD
				.relative( process.cwd(), path.join( __dirname, 'assets/stylesheets/shared/_utils.scss' ) )
				.split( path.sep ) // Break any path (posix/win32) by path separator
				.join( path.posix.sep ) // Convert the path explicitly to posix to ensure imports work fine
		}' as *;`,
	} );

	const plugins = SassConfig.plugins( {
		chunkFilename: cssChunkFilename,
		filename: cssFilename,
	} );

	return {
		loader,
		plugins,
	};
};

module.exports = {
	workerCount,
	getOutputFileName,
	getSCSSConfig,
};
