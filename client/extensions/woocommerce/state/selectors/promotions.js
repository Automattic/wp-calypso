/**
 * Internal dependencies
 */
import { getSelectedSiteWithFallback } from '../sites/selectors';

export function getPromotions( rootState, siteId = getSelectedSiteWithFallback( rootState ) ) {
	const { promotions } = rootState.extensions.woocommerce.sites[ siteId ];
	return promotions.promotions;
}

export function getPromotionsCurrentPage( rootState ) {
	const { promotions } = rootState.extensions.woocommerce.ui;
	return promotions.currentPage;
}

export function getPromotionsPerPage( rootState ) {
	const { promotions } = rootState.extensions.woocommerce.ui;
	return promotions.perPage;
}

