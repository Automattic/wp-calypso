const { parentPort, workerData } = require( 'worker_threads' );
const makePot = require( './index' );

const serializeError = ( error ) => {
	if ( error instanceof Error ) {
		return error.stack || error.message;
	}

	return String( error );
};

try {
	const { filepaths = [], options = {} } = workerData || {};

	filepaths.forEach( ( filepath ) => makePot( filepath, options ) );
} catch ( error ) {
	if ( parentPort ) {
		parentPort.postMessage( { type: 'error', error: serializeError( error ) } );
	}

	process.exitCode = 1;
}
