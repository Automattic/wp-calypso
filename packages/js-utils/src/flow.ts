// Variadic function composition is inherently loosely typed; like lodash's own
// types, the runtime is untyped and consumers rely on inference at the call.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = ( ...args: any[] ) => any;

/**
 * Creates a function that runs the given functions left-to-right, passing the
 * result of each to the next, matching lodash `flow`. Functions may be passed
 * variadically and/or in arrays (flattened one level); the first receives all
 * arguments, the rest a single value. `this` is forwarded.
 * @param funcs The functions to compose.
 * @returns The composed function.
 */
const flow = ( ...funcs: Array< AnyFunction | readonly AnyFunction[] > ): AnyFunction => {
	const fns = funcs.flat() as AnyFunction[];
	// Validate up front, like lodash, rather than failing on first invocation.
	for ( const fn of fns ) {
		if ( typeof fn !== 'function' ) {
			throw new TypeError( 'Expected a function' );
		}
	}
	return function ( this: unknown, ...args ) {
		let index = 0;
		let result = fns.length ? fns[ 0 ].apply( this, args ) : args[ 0 ];
		while ( ++index < fns.length ) {
			result = fns[ index ].call( this, result );
		}
		return result;
	};
};

export default flow;
