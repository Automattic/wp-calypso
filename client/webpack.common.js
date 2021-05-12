/* eslint-disable import/no-nodejs-modules */
const { cpus } = require( 'os' );

/**
 * Get an env var that should be a positive integer greater than 0
 *
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
		Math.min( Math.max( cpus().length - 1, 2, 32 ) )
	);
}

const concurrentBuilds = getEnvVarAsNaturalNumber( 'CONCURRENT_BUILDS', 1 );
if ( concurrentBuilds > 1 ) {
	workerCount = Math.max( 1, Math.floor( workerCount / concurrentBuilds ) );
}

module.exports = {
	workerCount,
};
