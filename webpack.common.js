/* eslint-disable import/no-nodejs-modules */

/**
 * @type {number} Number of workers that should be used for a build
 */
let workerCount;
if ( process.env.CIRCLECI ) {
	workerCount = 2;
} else if ( process.env.WORKERS && ! Number.isNaN( parseInt( process.env.WORKERS, 10 ) ) ) {
	workerCount = Math.max( 1, parseInt( process.env.WORKERS, 10 ) );
} else {
	workerCount = Math.max( 2, Math.floor( require( 'os' ).cpus().length / 2 ) );
}

/**
 * @type {boolean} Should the build use caching
 */
let useCache = true;
if ( 'docker' === process.env.CONTAINER ) {
	useCache = false;
}

/**
 * @type {boolean} Running in CI environment
 */
const isCi = !! process.env.CIRCLECI;

/**
 * @type {(string|undefined)} Git commit sha of build
 */
const commitSha = process.env.COMMIT_SHA ? process.env.COMMIT_SHA : undefined;

module.exports = Object.freeze( {
	commitSha,
	isCi,
	useCache,
	workerCount,
} );

// @TODO:
// process.env.BABEL_ENV;
// process.env.CALYPSO_CLIENT;
// process.env.CALYPSO_ENV;
// process.env.CALYPSO_IS_FORK;
// process.env.CHECK_CYCLES;
// process.env.CONTAINER;
// process.env.DISABLE_FEATURES;
// process.env.EMIT_STATS;
// process.env.ENABLE_FEATURES;
// process.env.HOME;
// process.env.HOST;
// process.env.MINIFY_JS;
// process.env.NODE_ENV;
// process.env.PORT;
// process.env.PROFILE;
// process.env.PROTOCOL;
// process.env.SOURCEMAP;
// process.env.TARGET_BROWSER;
// process.env.WORKERS;
