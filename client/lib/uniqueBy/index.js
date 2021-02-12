const defaultCompare = ( a, b ) => a === b;

/**
 * Filter duplicate values
 *
 * @param {Array} arr Array to operate on
 * @param {Function} fn Function to compare values
 */
export default function uniqueBy( arr, fn = defaultCompare ) {
	return arr.reduce( ( acc, v ) => {
		if ( ! acc.some( ( x ) => fn( v, x ) ) ) acc.push( v );
		return acc;
	}, [] );
}
