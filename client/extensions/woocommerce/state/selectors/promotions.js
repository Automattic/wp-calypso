/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteWithFallback } from '../sites/selectors';

export function getPromotions( rootState, siteId = getSelectedSiteWithFallback( rootState ) ) {
	const { promotions } = get( rootState, [ 'extensions', 'woocommerce', 'sites', siteId ], {} );
	return promotions.promotions;
}

export function getPromotionsPage( rootState, siteId = getSelectedSiteWithFallback( rootState ), page, perPage ) {
	const offset = ( page - 1 ) * perPage;
	const promotions = getPromotions( rootState, siteId );
	return ( promotions ? promotions.slice( offset, ( offset + perPage ) ) : null );
}

export function getPromotionsCurrentPage( rootState ) {
	const { list } = get( rootState, [ 'extensions', 'woocommerce', 'ui', 'promotions' ], {} );
	return list.currentPage;
}

export function getPromotionsPerPage( rootState ) {
	const { list } = get( rootState, [ 'extensions', 'woocommerce', 'ui', 'promotions' ], {} );
	return list.perPage;
}

