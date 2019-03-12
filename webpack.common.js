/* eslint-disable import/no-nodejs-modules */

/**
 * @type {(string|undefined)} Git commit sha of build
 */
const commitSha = process.env.COMMIT_SHA ? process.env.COMMIT_SHA : undefined;

/**
 * @type {(string|undefined)} Comma-joined string of disabled features
 */
const featuresDisabled = process.env.DISABLE_FEATURES ? process.env.DISABLE_FEATURES : undefined;
/**
 * @type {(string|undefined)} Comma-joined string of enabled features
 */
const featuresEnabled = process.env.ENABLE_FEATURES ? process.env.ENABLE_FEATURES : undefined;

/**
 * @type {boolean} Running in CI environment
 */
const isCi = !! process.env.CIRCLECI;

/**
 * @type {boolean} Enable the cyclic dependency checker
 */
const shouldCheckForCycles = process.env.CHECK_CYCLES === 'true';

/**
 * @type {boolean} Enable build stats
 */
const shouldEmitStats = process.env.EMIT_STATS && process.env.EMIT_STATS !== 'false';
/**
 * @type {boolean} Enable build stats with reasons
 */
const shouldEmitStatsWithReasons = process.env.EMIT_STATS === 'withreasons';

/* eslint-disable no-nested-ternary */
/**
 * @type {boolean} Should the build be minified
 *
 * @TODO: Can we move from `MINIFY_JS` to `MINIFY` and use it for JS and CSS?
 */
const shouldMinify =
	process.env.MINIFY_JS === 'true'
		? true
		: process.env.MINIFY_JS === 'false'
		? false
		: process.env.CALYPSO_ENV === 'desktop'
		? false
		: process.env.NODE_ENV === 'production';
/* eslint-enable no-nested-ternary */

/**
 * @type {boolean} Should the build use caching
 */
const useCache = 'docker' !== process.env.CONTAINER;

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

module.exports = Object.freeze( {
	commitSha,
	featuresDisabled,
	featuresEnabled,
	isCi,
	shouldCheckForCycles,
	shouldEmitStats,
	shouldEmitStatsWithReasons,
	shouldMinify,
	useCache,
	workerCount,
} );

// @TODO:
// process.env.BABEL_ENV;
// process.env.CALYPSO_CLIENT;
// process.env.CALYPSO_ENV;
// process.env.CALYPSO_IS_FORK;
// process.env.HOST;
// process.env.NODE_ENV;
// process.env.PORT;
// process.env.PROFILE;
// process.env.PROTOCOL;
// process.env.SOURCEMAP;
// process.env.TARGET_BROWSER;
