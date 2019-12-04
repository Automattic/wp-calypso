const inflight = new Set();

// Utility methods to track inflight async requests

export const isRequestInflight = requestKey => inflight.has( requestKey );

export const markRequestInflight = requestKey => inflight.add( requestKey );

export const completeRequest = requestKey => inflight.delete( requestKey );

export const requestTracker = ( requestKey, callback ) => {
	inflight.add( requestKey );

	return function( err, data ) {
		inflight.delete( requestKey );
		callback( err, data );
	};
};

export const trackPromise = ( requestKey, promise ) => {
	inflight.add( requestKey );
	promise.then(
		() => {
			inflight.delete( requestKey );
		},
		() => {
			inflight.delete( requestKey );
		}
	);
	// return the original promise so any subsequent thens don't flow through our handlers
	return promise;
};

export const _clear = () => inflight.clear();
