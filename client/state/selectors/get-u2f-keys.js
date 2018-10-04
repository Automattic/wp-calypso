/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the u2f keys of the current user.
 *
 * @param  {Object} state Global state tree
 * @return {Array}        U2f Keys
 */
export default state => get( state, [ 'u2fKeys', 'items' ], [ 1, 2, 4, 5, 6, 7 ] );
