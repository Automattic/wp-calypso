/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Return a boolean value indicating whether requesting for the password reset options is in progress.
 *
 * @param  {Object} state  Global state tree
 * @return {Boolean} If the request is in progress
 */

export default ( state ) => {
	return get( state, 'accountRecovery.reset.options.isRequesting', false );
};
