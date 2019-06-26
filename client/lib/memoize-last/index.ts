/**
 * Wraps a function in a utility method that remembers the last invocation's
 * arguments and results, and returns the latter if the former match.
 *
 * @param fn The function to be wrapped.
 *
 * @returns The wrapped function.
 */
export default function memoizeLast< T extends ( ...args: any[] ) => any >( fn: T ): T {
	let lastArgs: Parameters< T >;
	let lastResult: ReturnType< T >;

	return ( ( ...args: Parameters< T > ) => {
		const isSame =
			lastArgs &&
			args.length === lastArgs.length &&
			args.every( ( arg, index ) => arg === lastArgs[ index ] );

		if ( ! isSame ) {
			lastArgs = args;
			lastResult = fn( ...args );
		}

		return lastResult;
	} ) as T;
}

/**
 * A stricter-typed alias of `memoizeLast`, for functions without arguments.
 * Since it only accepts functions without arguments, it effectively guarantees
 * that the provided function will only be run once, as the check for whether
 * the arguments have not changed will always pass.
 *
 * @param fn The function to be wrapped.
 *
 * @returns The wrapped function.
 */
export function once< T extends () => any >( fn: T ) {
	// Runtime validation. Useful when static validation is unavailable.
	if ( process.env.NODE_ENV !== 'production' && fn.length !== 0 ) {
		throw new Error( 'memoize-last: The `once` method expects a function with no arguments.' );
	}
	return memoizeLast( fn );
}
