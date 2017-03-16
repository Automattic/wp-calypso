/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * @param {Object} state Global app state
 * @return {Object} An object encapsulates the error from requesting for the password reset options.
 */
export default ( state ) => {
	return get( state, 'accountRecovery.reset.options.error', null );
};
