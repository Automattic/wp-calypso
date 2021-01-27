/**
 * Internal dependencies
 */
import config from 'calypso/config';
import canCurrentUserUseAnyWooCommerceBasedStore from 'calypso/state/sites/selectors/can-current-user-use-any-woocommerce-based-store';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { isBusinessPlan, isEcommercePlan } from 'calypso/lib/plans';

/**
 * Returns true if current user can see and use the WooCommerce Core-based option in menu
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?boolean}        Whether current user can use WooCommerce
 */
export default function canCurrentUserUseWooCommerceCoreStore( state, siteId = null ) {
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	const currentPlan = getCurrentPlan( state, siteId );

	if ( ! currentPlan ) {
		return false;
	}

	const isCalypsoStoreDeprecatedOrRemoved =
		config.isEnabled( 'woocommerce/store-deprecated' ) ||
		config.isEnabled( 'woocommerce/store-removed' );

	return (
		canCurrentUserUseAnyWooCommerceBasedStore( state, siteId ) &&
		( isEcommercePlan( currentPlan.productSlug ) ||
			( isBusinessPlan( currentPlan.productSlug ) && isCalypsoStoreDeprecatedOrRemoved ) )
	);
}
