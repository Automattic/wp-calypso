interface Clearable {
	clear(): void;
}

const UNSET_SYMBOL = Symbol();
/**
 * Wraps a function in a utility method that remembers the last invocation's
 * arguments and results, and returns the latter if the former match.
 *
 * @param fn The function to be wrapped.
 *
 * @returns The wrapped function.
 */
export default function memoizeLast< T extends ( ...args: any[] ) => any >( fn: T ): T & Clearable {
	let lastArgs: Parameters< T > | symbol = UNSET_SYMBOL;
	let lastResult: ReturnType< T > | symbol = UNSET_SYMBOL;

	const func = ( ( ...args: Parameters< T > ) => {
		if ( lastArgs === UNSET_SYMBOL ) {
			lastArgs = args;
			lastResult = fn( ...args );
			return lastResult;
		}

		const isSame =
			args.length === ( lastArgs as Parameters< T > ).length &&
			args.every( ( arg, index ) => arg === ( lastArgs as Parameters< T > )[ index ] );

		if ( ! isSame ) {
			lastArgs = args;
			lastResult = fn( ...args );
		}

		return lastResult;
	} ) as T & Clearable;

	func.clear = () => {
		lastArgs = UNSET_SYMBOL;
		lastResult = UNSET_SYMBOL;
	};

	return func;
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
