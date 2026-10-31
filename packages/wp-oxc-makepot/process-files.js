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

		worker.on( 'error', reject );
		worker.on( 'exit', ( code ) => {
			if ( code === 0 ) {
				resolve();
			} else {
				reject( new Error( `wp-oxc-makepot worker exited with code ${ code }` ) );
			}
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
