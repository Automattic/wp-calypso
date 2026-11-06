const { workerData } = require( 'worker_threads' );
const makePot = require( './index' );

const { filepaths, options } = workerData;

filepaths.forEach( ( filepath ) => makePot( filepath, options ) );
