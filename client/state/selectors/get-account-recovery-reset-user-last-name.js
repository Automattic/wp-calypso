/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * @param {Object} state Global app state
 * @return {String} The last name of the user making password reset request.
 */
export default ( state ) => {
	return get( state, 'accountRecovery.reset.userData.lastName', '' );
};
