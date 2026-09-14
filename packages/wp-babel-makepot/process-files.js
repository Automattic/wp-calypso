const path = require( 'path' );
const { Worker } = require( 'worker_threads' );
const makePot = require( './index' );

const partitionFilepaths = ( filepaths, workerCount ) => {
	const partitions = Array.from( { length: workerCount }, () => [] );

	filepaths.forEach( ( filepath, index ) => {
		partitions[ index % workerCount ].push( filepath );
	} );

	return partitions.filter( ( partition ) => partition.length > 0 );
};

const runWorker = ( filepaths, options ) =>
	new Promise( ( resolve, reject ) => {
		const worker = new Worker( path.resolve( __dirname, 'worker.js' ), {
			workerData: { filepaths, options },
		} );

		let isSettled = false;

		worker.on( 'message', ( message ) => {
			if ( ! message || typeof message !== 'object' ) {
				return;
			}

			if ( message.type === 'error' && ! isSettled ) {
				isSettled = true;
				reject( new Error( message.error ) );
			}
		} );

		worker.on( 'error', ( error ) => {
			if ( isSettled ) {
				return;
			}

			isSettled = true;
			reject( error );
		} );

		worker.on( 'exit', ( code ) => {
			if ( isSettled ) {
				return;
			}

			if ( code !== 0 ) {
				isSettled = true;
				reject( new Error( `wp-babel-makepot worker exited with code ${ code }` ) );
				return;
			}

			isSettled = true;
			resolve();
		} );
	} );

module.exports = async ( filepaths, options = {} ) => {
	const { jobs = 1, ...makePotOptions } = options;

	if ( filepaths.length === 0 ) {
		return;
	}

	if ( jobs <= 1 || filepaths.length === 1 ) {
		filepaths.forEach( ( filepath ) => makePot( filepath, makePotOptions ) );
		return;
	}

	const workerCount = Math.min( jobs, filepaths.length );
	const partitions = partitionFilepaths( filepaths, workerCount );

	await Promise.all( partitions.map( ( partition ) => runWorker( partition, makePotOptions ) ) );
};
