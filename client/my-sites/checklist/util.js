/** @format */

/**
 * Update an array of objects with an id property with an object of objects keyed by id.
 *
 * Given an array of objects with an id property, update and add properties from the provided object
 * keyed by id.
 *
 * @example
 *   mergeObjectIntoArrayById(
 *     [ { id: 'a', prop: 'stale', keep: 'keep' } ],
 *     {
 *       a: { prop: 'fresh', add: 'new' }
 *     }
 *   )
 *   // results in…
 *   [ { id: 'a', prop: 'fresh', keep: 'keep', add: 'new' } ],
 *
 * @param  {Array<Object>}   arr  An array of objects, each of which must contain an `id` property
 * @param  {Object}          obj  An object whose keys match ids and values are objects or properties to update
 * @return {Array<Object>}        A new array with updated objects
 *
 */
export function mergeObjectIntoArrayById( arr, obj ) {
	return arr.map( item => ( obj[ item.id ] ? { ...item, ...obj[ item.id ] } : item ) );
}
