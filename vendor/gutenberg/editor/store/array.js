/**
 * External dependencies
 */
import { castArray } from 'lodash';

/**
 * Insert one or multiple elements into a given position of an array.
 *
 * @param {Array}  array    Source array.
 * @param {*}      elements Elements to insert.
 * @param {number} index    Insert Position.
 *
 * @return {Array}          Result.
 */
export function insertAt( array, elements, index ) {
	return [
		...array.slice( 0, index ),
		...castArray( elements ),
		...array.slice( index ),
	];
}

/**
 * Moves an element in an array.
 *
 * @param {Array}  array Source array.
 * @param {number} from  Source index.
 * @param {number} to    Destination index.
 * @param {number} count Number of elements to move.
 *
 * @return {Array}       Result.
 */
export function moveTo( array, from, to, count = 1 ) {
	const withoutMovedElements = [ ...array ];
	withoutMovedElements.splice( from, count );
	return insertAt(
		withoutMovedElements,
		array.slice( from, from + count ),
		to,
	);
}
