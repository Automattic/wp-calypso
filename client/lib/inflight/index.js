const inflight = new Set();

// Utility methods to track inflight async requests
export function requestInflight( requestKey ) {
	return inflight.has( requestKey );
}

export function requestTracker( requestKey, callback ) {
	inflight.add( requestKey );
	return function( error, data ) {
		inflight.delete( requestKey );
		callback( error, data );
	};
}

export function promiseTracker( requestKey, promise ) {
	inflight.add( requestKey );
	promise
		.then(
			() => inflight.delete( requestKey ),
			() => inflight.delete( requestKey ),
		);
	return promise;
}

export default {
	requestInflight,
	requestTracker,
	promiseTracker,
};
