/**
 * Internal Dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { isEnabled } from 'config';
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

	if ( ! isSiteOnAtomicPlan( state, siteId ) ) {
		return false;
	}

	return canCurrentUser( state, siteId, 'manage_options' );
}
