/**
 * Internal dependencies
 */
import { getSelectedSiteWithFallback } from '../sites/selectors';

export function getPromotions( rootState, siteId = getSelectedSiteWithFallback( rootState ) ) {
	const { promotions } = rootState.extensions.woocommerce.sites[ siteId ];
	return promotions.promotions;
}

