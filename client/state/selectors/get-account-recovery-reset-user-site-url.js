/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * @param {Object} state Global app state
 * @return {String} The url of one of the sites under the user making password reset request.
 */
export default ( state ) => {
	return get( state, 'accountRecovery.reset.userData.url', '' );
};
