/**
 * External dependencies
 */
import defer from 'lodash/defer';

const queues = new Map();

/***
 * Processes the `queueKey` queue in a FIFO order
 *
 * @param {String} queueKey name of the queue to process
 */
const processQueue = queueKey => {
	const queue = queues.get( queueKey );
	if ( ! queue || queue.length === 0 || queue.processing ) {
		return;
	}

	queue.processing = true;
	const nextRound = nextQueueKey => {
		queue.processing = false;
		defer( () => processQueue( nextQueueKey ) );
	};

	const nextInLine = queue.shift();

	const {
		operation,
		promiseResolver,
		promiseRejector,
	} = nextInLine;

	operation().then( data => {
		promiseResolver( data );
		nextRound( queueKey );
	}, error => {
		promiseRejector( error );
		nextRound( queueKey );
	} );
};

/***
 * Queues an operation to be performed in a FIFO serial manner relative to the queueKey
 *
 * @param {String} queueKey the key by which "group" the operations in serial
 * @param {Function} operation the operation function
 * @returns {Promise} a promise that will be called with the operations return value
 */
const queueOperation = ( queueKey, operation ) => {
	if ( typeof operation !== 'function' ) {
		throw new Error( 'Provided operation must be a function' );
	}

	let promiseResolver,
		promiseRejector;

	const promise = new Promise( ( resolve, reject ) => {
		promiseResolver = resolve;
		promiseRejector = reject;
	} );

	const descriptor = {
		operation,
		promiseRejector,
		promiseResolver
	};

	if ( ! queues.has( queueKey ) ) {
		queues.set( queueKey, [] );
	}

	queues.get( queueKey ).push( descriptor );

	processQueue( queueKey );

	return promise;
};

export default queueOperation;
