/**
 * Collapses a value into a string key with set-equality
 *
 * This function can be used to create a mostly-deterministic
 * reference key for a value such that varieties of the same
 * values which don't actually change the nominal meaning of
 * the values will collapse to the same key.
 *
 * Arrays are compared set-wise and so two
 * arrays with the same elements but having different
 * orderings will be treated as equals.
 *
 * The sort values are unstable so in some cases two values
 * could produce different keys even though we would consider
 * them to be otherwise equivalent. Since we aren't using a
 * multi-key sort or a custom comparison function, however,
 * this _may_ not affect us here.
 *
 * Additionally the built-in universal sort is lexicographic,
 * meaning that it won't properly sort numeric values, though
 * it should sort them stably.
 *
 * The sort implementation may be different depending on the
 * browser. At the time of this commit Chrome is still unstable
 * while Safari is stable.
 *
 * This function is recursive to the depth
 * that the input value itself is nested..
 *
 * @example
 * deterministicStringify( [ 1, 2, 3 ] ) === "1,2,3"
 * deterministicStringify( [ 3, 2, 1 ] ) === "1,2,3"
 * deterministicStringify( { a: 5, b: null } ) = "'a'=5&'b'='null'"
 * deterministicStringify( { b: null, a: 5 } ) = "'a'=5&'b'='null'"
 *
 * @param {*} source input value to collapse
 * @returns {String} key associated with input value
 */
export function deterministicStringify( source ) {
	if ( source === null ) {
		return 'null';
	}

	// Handle primitive data types:
	// boolean, number, string, undefined
	if ( typeof source !== 'object' ) {
		return typeof source === 'string'
			? `'${ source }'`
			: String( source );
	}

	// arrays are objects too so we have to
	// manually ask if this is _also_ an array
	if ( Array.isArray( source ) ) {
		return source
			.slice() // sort mutates the original array!
			.sort()
			.map( deterministicStringify )
			.join( ',' );
	}

	// else return stringified object with
	// keys in alphabetical order
	return Object
		.keys( source )
		.sort() // Note that Array.prototype.sort is _unstable_, bugs may hide here
		.map( key => `${ key }=${ deterministicStringify( source[ key ] ) }` )
		.join( '&' );
}

export default deterministicStringify;
