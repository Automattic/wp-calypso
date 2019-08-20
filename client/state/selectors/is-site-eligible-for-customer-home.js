/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';

/**
 * Returns true if the current should be able to use the customer home screen
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @return {?Boolean}        Whether the site can use the customer home screen
 */
export default function isSiteEligibleForCustomerHome( state, siteId = null ) {
	//TODO Add A/B test and new site logic
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	return ! ( isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId ) );
}
