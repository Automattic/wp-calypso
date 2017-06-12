/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns a boolean value indicating whether validating the account recovery key is in progress.
 *
 * @param  {Object} state Global state tree
 * @return {Boolean}      The validation is in progress or not.
 */
export default ( state ) => get( state, 'accountRecovery.reset.validate.isRequesting', false );
