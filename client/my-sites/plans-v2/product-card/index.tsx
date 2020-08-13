/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { ITEM_TYPE_PLAN, ITEM_TYPE_BUNDLE, ITEM_TYPE_PRODUCT } from '../constants';
import { durationToText, productButtonLabel } from '../utils';
import { isProductsListFetching } from 'state/products-list/selectors/is-products-list-fetching';
import { getProductCost } from 'state/products-list/selectors';
import JetpackPlanCard from 'components/jetpack/card/jetpack-plan-card';
import JetpackBundleCard from 'components/jetpack/card/jetpack-bundle-card';
import JetpackProductCard from 'components/jetpack/card/jetpack-product-card';

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
	currencyCode: string;
}

const ProductCard = ( { item, onClick, currencyCode }: ProductCardProps ) => {
	const isFetchingPrices = useSelector( ( state ) => isProductsListFetching( state ) );
	const itemCost = useSelector( ( state ) =>
		getProductCost( state, item.costProductSlug || item.productSlug )
	);
	const monthlyItemCost = useSelector( ( state ) =>
		getProductCost( state, item.monthlyProductSlug || '' )
	);

	let originalPrice = 0;
	let discountedPrice = undefined;
	if ( ! isFetchingPrices && itemCost ) {
		originalPrice = itemCost;
		if ( monthlyItemCost ) {
			originalPrice = monthlyItemCost * 12;
			discountedPrice = itemCost;
		}
	}

	const CardComponent = itemToCard( item );
	return (
		<CardComponent
			iconSlug={ item.iconSlug }
			productName={ item.displayName }
			subheadline={ item.tagline }
			description={ item.description }
			currencyCode={ currencyCode }
			billingTimeFrame={ durationToText( item.term ) }
			buttonLabel={ productButtonLabel( item ) }
			onButtonClick={ () => onClick( item ) }
			features={ item.features }
			originalPrice={ originalPrice }
			discountedPrice={ discountedPrice }
			withStartingPrice={ item.subtypes.length > 0 }
			isOwned={ item.owned }
			isDeprecated={ item.legacy }
		/>
	);
};

export default ProductCard;
