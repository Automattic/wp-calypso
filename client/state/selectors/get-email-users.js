/**
 * Internal dependencies
 */
import getGSuiteUsers from 'state/selectors/get-gsuite-users';
import getTitanUsers from 'state/selectors/get-titan-users';
import { PROVIDER_GSUITE, PROVIDER_TITAN } from 'lib/email/constants';

/**
 * Retrieves an object containing the list of email users per provider, for the specified site.
 *
 * @param {object} state - global state tree
 * @param {number} siteId - identifier of the site
 * @returns {object} an object keyed by the list of email users
 */
export default function getEmailUsers( state, siteId ) {
	return {
		[ PROVIDER_GSUITE ]: getGSuiteUsers( state, siteId ),
		[ PROVIDER_TITAN ]: getTitanUsers( state, siteId ),
	};
}
