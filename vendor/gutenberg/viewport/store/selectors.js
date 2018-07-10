/**
 * External dependencies
 */
import { takeRight } from 'lodash';

/**
 * Returns true if the viewport matches the given query, or false otherwise.
 *
 * @param {Object} state Viewport state object.
 * @param {string} query Query string. Includes operator and breakpoint name,
 *                       space separated. Operator defaults to >=.
 *
 * @example
 *
 * ```js
 * isViewportMatch( state, '< huge' );
 * isViewPortMatch( state, 'medium' );
 * ```
 *
 * @return {boolean} Whether viewport matches query.
 */
export function isViewportMatch( state, query ) {
	// Pad to _at least_ two elements to take from the right, effectively
	// defaulting the left-most value.
	const key = takeRight( [ '>=', ...query.split( ' ' ) ], 2 ).join( ' ' );

	return !! state[ key ];
}
