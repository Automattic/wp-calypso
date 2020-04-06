/**
 * Internal dependencies
 */
import getSiteOption from './get-site-option';

const MINUTE_IN_MS = 60 * 1000;

/**
 * Returns true if the site is created less than 30 mins ago.
 * False otherwise.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}        Whether site is newly created.
 */
export default function isNewSite( state, siteId ) {
	const createdAt = getSiteOption( state, siteId, 'created_at' );

	if ( ! createdAt ) {
		return false;
	}

	// less than 30 minutes
	return Date.now() - new Date( createdAt ) < 30 * MINUTE_IN_MS;
}
