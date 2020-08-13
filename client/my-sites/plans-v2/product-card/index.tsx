/**
 * External dependencies
 */
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate, TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { ITEM_TYPE_PLAN, ITEM_TYPE_BUNDLE, ITEM_TYPE_PRODUCT } from '../constants';
import { durationToText, productButtonLabel } from '../utils';
import { isProductsListFetching } from 'state/products-list/selectors/is-products-list-fetching';
import { getProductCost } from 'state/products-list/selectors/get-product-cost';
import getSitePlan from 'state/sites/selectors/get-site-plan';
import getSiteProducts from 'state/sites/selectors/get-site-products';
import JetpackPlanCard from 'components/jetpack/card/jetpack-plan-card';
import JetpackBundleCard from 'components/jetpack/card/jetpack-bundle-card';
import JetpackProductCard from 'components/jetpack/card/jetpack-product-card';
import { TERM_MONTHLY } from 'lib/plans/constants';

/**
 * Type dependencies
 */
import type { PurchaseCallback, SelectorProduct } from '../types';

const itemToCard = ( { type }: SelectorProduct ) => {
	switch ( type ) {
		case ITEM_TYPE_PLAN:
			return JetpackPlanCard;
		case ITEM_TYPE_BUNDLE:
			return JetpackBundleCard;
		case ITEM_TYPE_PRODUCT:
		default:
			return JetpackProductCard;
	}
};

interface ProductCardProps {
	item: SelectorProduct;
	onClick: PurchaseCallback;
	siteId: number | null;
	currencyCode: string;
	className?: string;
}

const ProductCard = ( { item, onClick, siteId, currencyCode, className }: ProductCardProps ) => {
	const translate = useTranslate();

	// Determine whether product is owned.
	const sitePlan = useSelector( ( state ) => getSitePlan( state, siteId ) );
	const siteProducts = useSelector( ( state ) => getSiteProducts( state, siteId ) );
	const isOwned = useMemo( () => {
		if ( sitePlan && sitePlan.product_slug === item.productSlug ) {
			return true;
		} else if ( siteProducts ) {
			return siteProducts
				.filter( ( product ) => ! product.expired )
				.map( ( product ) => product.productSlug )
				.includes( item.productSlug );
		}
		return false;
	}, [ item.productSlug, sitePlan, siteProducts ] );

	// Calculate the product price.
	const isFetchingPrices = useSelector( ( state ) => isProductsListFetching( state ) );
	const itemCost = useSelector( ( state ) =>
		getProductCost( state, item.costProductSlug || item.productSlug )
	);
	const monthlyItemCost = useSelector( ( state ) =>
		getProductCost( state, item.monthlyProductSlug || '' )
	);

	let originalPrice = 999; // NOTE: Temp cost for products who are not in API yet.
	let discountedPrice = undefined;
	if ( ! isFetchingPrices && itemCost ) {
		originalPrice = itemCost;
		if ( monthlyItemCost && item.term !== TERM_MONTHLY ) {
			originalPrice = monthlyItemCost * 12;
			discountedPrice = itemCost;
		}
	}

	// Handle badge label.
	let badgeLabel: TranslateResult = '';
	if ( isOwned ) {
		badgeLabel = translate( 'You own this' );
	}

	const CardComponent = itemToCard( item ); // Get correct card component.
	return (
		<CardComponent
			iconSlug={ item.iconSlug }
			productName={ item.displayName }
			subheadline={ item.tagline }
			description={ item.description }
			currencyCode={ currencyCode }
			billingTimeFrame={ durationToText( item.term ) }
			buttonLabel={ isOwned ? translate( 'Manage subscription' ) : productButtonLabel( item ) }
			onButtonClick={ () => onClick( item ) }
			badgeLabel={ badgeLabel }
			features={ item.features }
			originalPrice={ originalPrice }
			discountedPrice={ discountedPrice }
			withStartingPrice={ item.subtypes.length > 0 }
			isOwned={ isOwned }
			isDeprecated={ item.legacy }
			className={ className }
		/>
	);
};

export default ProductCard;
