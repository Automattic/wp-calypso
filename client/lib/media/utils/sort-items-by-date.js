/**
 * Given an array of media objects, returns a copy sorted by media date.
 * @param  {Array} items Array of media objects
 * @returns {Array}       Sorted array of media objects
 */
export function sortItemsByDate( items ) {
	return items.slice( 0 ).sort( function ( a, b ) {
		if ( a.date && b.date ) {
			const dateCompare = Date.parse( b.date ) - Date.parse( a.date );

			// We only return the result of a date comaprison if item dates
			// are set and the dates are not equal...
			if ( 0 !== dateCompare ) {
				return dateCompare;
			}
		}

		// ...otherwise, we return the greater of the two item IDs
		return b.ID - a.ID;
	} );
}
