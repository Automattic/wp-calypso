/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the string of validation key entered by a user during the AR process to validate one's account ownership.
 *
 * @param  {Object} state Global state tree.
 * @return {?String}      Validation key string.
 */
export default ( state ) => get( state, 'accountRecovery.reset.key', null );
