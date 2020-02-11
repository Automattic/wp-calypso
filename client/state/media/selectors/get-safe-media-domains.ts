/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import getSite from 'state/sites/selectors/get-site';
import isPrivateSite from 'state/selectors/is-private-site';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';

/**
 * Returns a list of domains that we consider safe for the purposes of loading media. Non-a8c URLs
 * refering to domains not returned by this selector are going to be wrapped in photon.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site id
 * @returns {string[]}      Safe domains
 */
export default function getSafeMediaDomains( state: any, siteId: number | null ) {
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	if ( ! siteId ) {
		return [];
	}
	const site = getSite( state, siteId );
	if ( isSiteAutomatedTransfer( state, siteId ) && isPrivateSite( state, siteId ) ) {
		// We need to bypass photon and go straight to site domain for private atomic sites - let's whitelist primary domain
		return [ site.domain ];
	}
	return [];
}
