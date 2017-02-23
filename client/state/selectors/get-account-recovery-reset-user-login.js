/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * @param {Object} state Global app state
 * @return {String} The user login. It can be either a user name or an email address.
 */
export default ( state ) => {
	return get( state, 'accountRecovery.reset.userData.user', '' );
};
