/** @format */

/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import { isEnabled } from 'config';
import { isBusinessPlan } from 'lib/plans';

/**
 * TODO: this selector should be backed by an API response instead
 * Returns true if hosting section should be viewable
 *
 * @param  {Object}  state  Global state tree
 * @return {?Boolean}        Whether site can display the atomic hosting section
 */
export default function canSiteViewAtomicHosting( state ) {
	if ( ! isEnabled( 'hosting' ) ) {
		return false;
	}

	const siteId = getSelectedSiteId( state );
	// This is also enforced on the server, please remove client checks later.
	// ID of site added 31 Oct 2019, so only sites newer currently eligible
	if ( siteId > 168768859 ) {
		const isAtomicSite = !! isSiteAutomatedTransfer( state, siteId );

		if ( isAtomicSite ) {
			return true;
		}

		if ( isEnabled( 'hosting/non-atomic-support' ) ) {
			return isBusinessPlan( get( getSelectedSite( state ), [ 'plan', 'product_slug' ] ) );
		}
	}

	return false;
}
