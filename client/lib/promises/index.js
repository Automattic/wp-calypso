/**
 * Consumes a list by
 * - creating a promise from an item
 * - waiting until its resolution
 * - proceeding to the next item
 *
 * Returns a promise that waits for the last item promise to be resolved.
 */
export const makePromiseSequence = ( list, fn ) => list.reduce(
	( acc, curr ) => acc.then( fn.bind( null, curr ) ),
	Promise.resolve()
);

/**
 * Takes a promise and transform it to a cancelable promise by adding a "cancel" method
 * @param   {Promise} promise Promise to make cancelable
 * @return  {Promise}         Cancelble promise
 */
export const makePromiseCancelable = promise => {
	let hasCanceled_ = false;
	const wrappedPromise = new Promise( ( resolve, reject ) => {
		promise.then( val =>
			hasCanceled_ ? reject( { isCanceled: true } ) : resolve( val )
		);
		promise.catch( error =>
			hasCanceled_ ? reject( { isCanceled: true } ) : reject( error )
		);
	} );

	return {
		promise: wrappedPromise,
		cancel() {
			hasCanceled_ = true;
		},
	};
};
