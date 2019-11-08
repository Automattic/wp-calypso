/* eslint-disable import/no-nodejs-modules */

let workerCount;

if ( process.env.CIRCLECI ) {
	workerCount = 2;
} else if ( process.env.WORKERS && ! Number.isNaN( parseInt( process.env.WORKERS, 10 ) ) ) {
	workerCount = Math.max( 1, parseInt( process.env.WORKERS, 10 ) );
} else {
	workerCount = Math.max( 2, Math.floor( require( 'os' ).cpus().length / 2 ) );
}

workerCount = Math.max( 1, Math.floor( workerCount / 2 ) );

module.exports = {
	workerCount,
};
