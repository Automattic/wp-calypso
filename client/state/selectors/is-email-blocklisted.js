/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import getSiteSetting from 'state/selectors/get-site-setting';

/**
 * Check if a site blocklist contains an email address.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @param {string} email An email address.
 * @returns {boolean} If the blocklist contains the email address.
 */
export const isEmailBlocklisted = ( state, siteId, email = '' ) => {
	const blocklist = getSiteSetting( state, siteId, 'blacklist_keys' ) || '';
	return includes( blocklist.split( '\n' ), email );
};

export default isEmailBlocklisted;
