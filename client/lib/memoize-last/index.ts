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
