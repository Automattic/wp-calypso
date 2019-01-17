/** @format */
/**
 * Wraps a function in a utility method that remembers the last invocation's
 * arguments and results, and returns the latter if the former match.
 *
 * @param {Function} fn The function to be wrapped.
 *
 * @returns {Function} The wrapped function.
 */
export default function memoizeLast( fn ) {
	let lastArgs;
	let lastResult;

	return ( ...args ) => {
		const isSame =
			lastArgs &&
			args.length === lastArgs.length &&
			args.every( ( arg, index ) => arg === lastArgs[ index ] );

		if ( ! isSame ) {
			lastArgs = args;
			lastResult = fn( ...args );
		}

		return lastResult;
	};
}
