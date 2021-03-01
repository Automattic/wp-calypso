/**
 * Internal dependencies
 */
import { isCurrentUserCurrentPlanOwner } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import isCurrentPlanPaid from './is-current-plan-paid';

/**
 * Returns true if current user can purchase upgrades for this site
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?boolean}        Whether site is previewable
 */
export default function canCurrentUserUpgradeSite( state, siteId = null ) {
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	const canUserManageOptions = canCurrentUser( state, siteId, 'manage_options' );
	if ( ! canUserManageOptions ) {
		return false;
	}

	const isPaid = isCurrentPlanPaid( state, siteId );
	return ! isPaid || isCurrentUserCurrentPlanOwner( state, siteId );
}
