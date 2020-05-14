/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the application passwords of the current user.
 *
 * @param  {object} state Global state tree
 * @returns {Array}        Application passwords
 */
/*@__INLINE__*/
export default ( state ) => get( state, [ 'applicationPasswords', 'items' ], [] );
