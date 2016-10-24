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

