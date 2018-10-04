/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the application passwords of the current user.
 *
 * @param  {Object} state Global state tree
 * @return {Array}        Application passwords
 */
export default state => get( state, [ 'applicationPasswords', 'items' ], [] );
