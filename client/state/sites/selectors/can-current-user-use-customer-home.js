/**
 * Internal dependencies
 */
import canCurrentUser from 'state/selectors/can-current-user';
import { getSelectedSiteId } from 'state/ui/selectors';
import getSite from './get-site';
import isSiteEligibleForCustomerHome from 'state/selectors/is-site-eligible-for-customer-home';

/**
 * Returns true if the current user can see the Customer Home menu item and the corresponding section.
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @return {?Boolean}        Whether user can access the Custome Home section.
 */
export default function canCurrentUserUseCustomerHome( state, siteId = null ) {
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	const site = getSite( state, siteId );
	return (
		site &&
		isSiteEligibleForCustomerHome( state, siteId ) &&
		!! canCurrentUser( state, siteId, 'manage_options' )
	);
}
