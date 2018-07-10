/** @format */

/**
 * Merge object into array
 *
 * Given an array of objects and an object of objects, merge the object's values
 * into array items, using the array's objects' `id` values to determine which
 * key to use for merging.
 *
 * @param   {Array}   arr  An array of objects, each of which must contain an `id` key
 * @param   {Object}  obj  An object
 * @returns {Array}        The merged array
 *
 */
export function mergeObjectIntoArrayById( arr, obj ) {
	return arr.map( item => ( { ...item, ...obj[ item.id ] } ) );
}
