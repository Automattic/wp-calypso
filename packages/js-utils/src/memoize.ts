export interface MemoizedFunction< Args extends unknown[], Return > {
	( ...args: Args ): Return;
	cache: Map< unknown, Return >;
}

/**
 * Wraps a function so results are cached by a key derived from its arguments.
 * By default the key is the first argument; pass `resolver` to compute a custom
 * key. The cache is exposed as `.cache` (a `Map`) so callers can clear or
 * inspect it. Unlike lodash's `memoize`, this does not support a pluggable
 * `memoize.Cache` or argument-type `TypeError` checks.
 * @param func The function to have its output memoized.
 * @param resolver Optional function that resolves the cache key from the arguments.
 * @returns The memoized function, with its cache exposed as `.cache`.
 */
const memoize = < Args extends unknown[], Return >(
	func: ( ...args: Args ) => Return,
	resolver?: ( ...args: Args ) => unknown
): MemoizedFunction< Args, Return > => {
	// Use a regular function (not an arrow) so the caller's `this` is forwarded
	// to `func`/`resolver` via `func.apply( this, args )`.
	const memoized = function ( this: unknown, ...args: Args ): Return {
		const key = resolver ? resolver.apply( this, args ) : args[ 0 ];
		const { cache } = memoized;
		if ( cache.has( key ) ) {
			return cache.get( key ) as Return;
		}
		const result = func.apply( this, args );
		cache.set( key, result );
		return result;
	} as MemoizedFunction< Args, Return >;
	memoized.cache = new Map< unknown, Return >();
	return memoized;
};

export default memoize;
