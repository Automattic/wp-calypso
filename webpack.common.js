/* eslint-disable import/no-nodejs-modules */

// Number of workers that should be used for a build
let workerCount;
if ( process.env.CIRCLECI ) {
	workerCount = 2;
} else if ( process.env.WORKERS && ! Number.isNaN( parseInt( process.env.WORKERS, 10 ) ) ) {
	workerCount = Math.max( 1, parseInt( process.env.WORKERS, 10 ) );
} else {
	workerCount = Math.max( 2, Math.floor( require( 'os' ).cpus().length / 2 ) );
}

let useCache = true;
if ( 'docker' === process.env.CONTAINER ) {
	useCache = false;
}

const isCi = !! process.env.CIRCLECI;

// process.env.COMMIT_SHA;
// process.env.BABEL;
// process.env.CALYPSO;
// process.env.CHECK;
// process.env.CIRCLECI;
// process.env.COMMIT;
// process.env.CONTAINER;
// process.env.DISABLE;
// process.env.EMIT;
// process.env.ENABLE;
// process.env.HOME;
// process.env.HOST;
// process.env.MINIFY;
// process.env.NODE;
// process.env.PORT;
// process.env.PROFILE;
// process.env.PROTOCOL;
// process.env.SOURCEMAP;
// process.env.TARGET;

module.exports = Object.freeze( {
	isCi,
	useCache,
	workerCount,
} );
