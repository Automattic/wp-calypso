/**
 * Wraps a function so it runs at most once. The first invocation calls `fn` and
 * caches its result; every later invocation returns that cached result without
 * calling `fn` again (ignoring any later arguments).
 * @param fn The function to restrict to a single invocation.
 * @returns The restricted function.
 */
const once = < Args extends unknown[], Return >(
	fn: ( ...args: Args ) => Return
): ( ( ...args: Args ) => Return ) => {
	let called = false;
	let result: Return;
	// Use a regular function (not an arrow) so the caller's `this` is forwarded
	// to `fn`.
	return function ( this: unknown, ...args: Args ): Return {
		if ( ! called ) {
			called = true;
			result = fn.apply( this, args );
		}
		return result;
	};
};

export default once;
