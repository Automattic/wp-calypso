/**
 * Local variables
 */
const { keys } = Object;

/**
 * Returns true if the two objects are shallow equal, or false otherwise.
 *
 * @param {Object} a First object to compare.
 * @param {Object} b Second object to compare.
 *
 * @return {boolean} Whether the two objects are shallow equal.
 */
function isShallowEqualObjects( a, b ) {
	if ( a === b ) {
		return true;
	}

	const aKeys = keys( a );
	const bKeys = keys( b );

	if ( aKeys.length !== bKeys.length ) {
		return false;
	}

	let i = 0;

	while ( i < aKeys.length ) {
		const key = aKeys[ i ];
		if ( a[ key ] !== b[ key ] ) {
			return false;
		}

		i++;
	}

	return true;
}

export default isShallowEqualObjects;
