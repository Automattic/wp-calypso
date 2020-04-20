/**
 * External dependencies
 */
import { get, find, isObject } from 'lodash';

/**
 * Internal dependencies
 */

import { getSelectedSiteWithFallback } from '../sites/selectors';

export function getPromotions( rootState, siteId = getSelectedSiteWithFallback( rootState ) ) {
	const promotions = get(
		rootState,
		[ 'extensions', 'woocommerce', 'sites', siteId, 'promotions' ],
		{}
	);
	return promotions.promotions;
}

export function getPromotion(
	rootState,
	promotionId,
	siteId = getSelectedSiteWithFallback( rootState )
) {
	const promotions = getPromotions( rootState, siteId );
	return find( promotions, ( p ) => promotionId === p.id ) || null;
}

export function getPromotionsPage( promotions, page, perPage ) {
	const offset = ( page - 1 ) * perPage;
	return promotions ? promotions.slice( offset, offset + perPage ) : null;
}

export function getPromotionsCurrentPage( rootState ) {
	const list = get( rootState, [ 'extensions', 'woocommerce', 'ui', 'promotions', 'list' ], {} );
	return list.currentPage;
}

export function getPromotionsPerPage( rootState ) {
	const list = get( rootState, [ 'extensions', 'woocommerce', 'ui', 'promotions', 'list' ], {} );
	return list.perPage;
}

export function getPromotionsSearch( rootState ) {
	const list = get( rootState, [ 'extensions', 'woocommerce', 'ui', 'promotions', 'list' ], {} );
	return list.searchFilter || '';
}

export function getCurrentlyEditingPromotionId(
	rootState,
	siteId = getSelectedSiteWithFallback( rootState )
) {
	const edits = get(
		rootState,
		[ 'extensions', 'woocommerce', 'ui', 'promotions', 'edits', siteId ],
		{}
	);
	return edits.currentlyEditingId || null;
}

export function getPromotionEdits(
	rootState,
	promotionId,
	siteId = getSelectedSiteWithFallback( rootState )
) {
	const edits = get(
		rootState,
		[ 'extensions', 'woocommerce', 'ui', 'promotions', 'edits', siteId ],
		{}
	);

	if ( isObject( promotionId ) ) {
		return find( edits.creates, ( p ) => promotionId === p.id ) || null;
	}
	return find( edits.updates, ( p ) => promotionId === p.id ) || null;
}

export function getPromotionWithLocalEdits(
	rootState,
	promotionId,
	siteId = getSelectedSiteWithFallback( rootState )
) {
	const promotion = getPromotion( rootState, promotionId, siteId );
	const promotionEdits = getPromotionEdits( rootState, promotionId, siteId );

	if ( promotion || promotionEdits ) {
		return { ...promotion, ...promotionEdits };
	}
	return null;
}

export function getPromotionableProducts(
	rootState,
	siteId = getSelectedSiteWithFallback( rootState )
) {
	const promotions = get(
		rootState,
		[ 'extensions', 'woocommerce', 'sites', siteId, 'promotions' ],
		{}
	);
	return promotions.products;
}
