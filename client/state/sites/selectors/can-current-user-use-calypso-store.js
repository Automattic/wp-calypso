/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import canCurrentUserUseAnyWooCommerceBasedStore from 'calypso/state/sites/selectors/can-current-user-use-any-woocommerce-based-store';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { STORE_DEPRECATION_START_DATE } from 'calypso/lib/plans/constants';

/**
 * Returns true if current user can see and use the Calypso-based Store option in menu
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?boolean}        Whether current user can use the Calypso-based Store
 */
export default function canCurrentUserUseCalypsoStore( state, siteId = null ) {
	if (
		config.isEnabled( 'woocommerce/store-removed' ) ||
		! config.isEnabled( 'woocommerce/extension-dashboard' )
	) {
		return false;
	}

	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	const currentPlan = getCurrentPlan( state, siteId );

	if ( ! currentPlan ) {
		return false;
	}

	const subscribedDate = new Date( currentPlan.subscribedDate );
	const subscribedBeforeDeprecation = subscribedDate < STORE_DEPRECATION_START_DATE;

	return canCurrentUserUseAnyWooCommerceBasedStore( state, siteId ) && subscribedBeforeDeprecation;
}
