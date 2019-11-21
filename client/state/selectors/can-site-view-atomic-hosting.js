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
import canCurrentUser from 'state/selectors/can-current-user';
import isSiteOnAtomicPlan from 'state/selectors/is-site-on-atomic-plan';

/**
 * TODO: this selector should be backed by an API response instead
 * Returns true if hosting section should be viewable
 *
 * @param  {object}  state  Global state tree
 * @returns {?boolean}        Whether site can display the atomic hosting section
 */
export default function canSiteViewAtomicHosting( state ) {
	if ( ! isEnabled( 'hosting' ) ) {
		return false;
	}

	const siteId = getSelectedSiteId( state );

	// This is also enforced on the server, please remove client checks later.
	// ID of site added 31 Oct 2019, so only sites newer currently eligible
	const isEligibleSite = siteId > 168768859;
	if ( ! isEligibleSite ) {
		return false;
	}

	if ( ! isSiteOnAtomicPlan( state, siteId ) ) {
		return false;
	}

	const canManageOptions = canCurrentUser( state, siteId, 'manage_options' );
	if ( ! canManageOptions ) {
		return false;
	}

	const isAtomicSite = !! isSiteAutomatedTransfer( state, siteId );
	if ( isAtomicSite ) {
		return true;
	}

	const planSlug = get( getSelectedSite( state ), [ 'plan', 'product_slug' ] );
	return isBusinessPlan( planSlug ) && isEnabled( 'hosting/non-atomic-support' );
}
