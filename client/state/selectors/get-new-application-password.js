/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the application password that the user just created.
 *
 * @param  {object}  state Global state tree
 * @returns {?string}       New application password
 */
export default ( state ) => get( state, [ 'applicationPasswords', 'newPassword' ], null );
