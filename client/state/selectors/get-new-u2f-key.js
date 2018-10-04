/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the u2f key that the user just created.
 *
 * @param  {Object}  state Global state tree
 * @return {?String}       U2f key
 */
export default state => get( state, [ 'u2fKeys', 'newKey' ], null );
