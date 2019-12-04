/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import getSiteSetting from 'state/selectors/get-site-setting';

/**
 * Check if a site blacklist contains an email address.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {String} email An email address.
 * @returns {Boolean} If the blacklist contains the email address.
 */
export const isEmailBlacklisted = ( state, siteId, email = '' ) => {
	const blacklist = getSiteSetting( state, siteId, 'blacklist_keys' ) || '';
	return includes( blacklist.split( '\n' ), email );
};

export default isEmailBlacklisted;
