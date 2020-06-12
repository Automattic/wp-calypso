/**
 * Inserts the specified separator betwixt every element of the given list.
 *
 * @param {*} separator - separator to be inserted
 * @param {*[]} list - list
 * @returns {*[]} the list with separators
 */
export function interpose( separator, list ) {
	return list.reduce( function ( previousValue, currentValue, index ) {
		let value;
		if ( index > 0 ) {
			value = previousValue.concat( separator, currentValue );
		} else {
			value = previousValue.concat( currentValue );
		}
		return value;
	}, [] );
}
