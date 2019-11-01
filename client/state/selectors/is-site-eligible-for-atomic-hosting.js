/** @format */

/**
 * Internal Dependencies
 */
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Returns true if site is a Automated Transfer site and is currently eligible for hosting features
 *
 * @param  {Object}  state  Global state tree
 * @return {?Boolean}        Whether site is currently eligible for Atomic Hosting features
 */
export default function isSiteEligibleForAtomicHosting( state ) {
	const siteId = getSelectedSiteId( state );
	const atomicSite = isSiteAutomatedTransfer( state, siteId );

	return atomicSite && siteId > 168768859; // ID of site added 31 Oct 2019, so only sites newer currently eligible
}
