/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the application password that the user just created.
 *
 * @param  {Object}  state Global state tree
 * @return {?String}       New application password
 */
export default state => get( state, [ 'applicationPasswords', 'newPassword' ], null );
