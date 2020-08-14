/**
 * External dependencies
 */
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { ITEM_TYPE_PLAN, ITEM_TYPE_BUNDLE, ITEM_TYPE_PRODUCT } from '../constants';
import {
	durationToText,
	productButtonLabel,
	isUpgradeable,
	getRealtimeFromDaily,
	slugToSelectorProduct,
	productBadgeLabel,
} from '../utils';
import { isProductsListFetching } from 'state/products-list/selectors/is-products-list-fetching';
import { getProductCost } from 'state/products-list/selectors/get-product-cost';
import getSitePlan from 'state/sites/selectors/get-site-plan';
import getSiteProducts from 'state/sites/selectors/get-site-products';
import JetpackPlanCard from 'components/jetpack/card/jetpack-plan-card';
import JetpackBundleCard from 'components/jetpack/card/jetpack-bundle-card';
import JetpackProductCard from 'components/jetpack/card/jetpack-product-card';
import JetpackProductCardUpgradeNudge from 'components/jetpack/card/jetpack-product-card/upgrade-nudge';
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

interface UpgradeNudgeProps {
	item: SelectorProduct;
	currencyCode: string;
	onClick: PurchaseCallback;
}

const UpgradeNudgeWrapper = ( { item, currencyCode, onClick }: UpgradeNudgeProps ) => {
	const upgradeToProductSlug =
		getRealtimeFromDaily( item.costProductSlug || item.productSlug ) || '';
	const selectorProductToUpgrade = slugToSelectorProduct( upgradeToProductSlug );

	const isFetchingPrices = useSelector( ( state ) => isProductsListFetching( state ) );

	const itemCost = useSelector( ( state ) => getProductCost( state, upgradeToProductSlug ) );
	const monthlyItemCost = useSelector( ( state ) =>
		getProductCost( state, selectorProductToUpgrade?.monthlyProductSlug || '' )
	);

	if ( ! isUpgradeable( item.productSlug ) || isFetchingPrices || ! selectorProductToUpgrade ) {
		return null;
	}

	let originalPrice = 0;
	let discountedPrice = undefined;
	if ( ! isFetchingPrices && itemCost ) {
		originalPrice = itemCost;
		if ( monthlyItemCost && selectorProductToUpgrade.term !== TERM_MONTHLY ) {
			originalPrice = monthlyItemCost * 12;
			discountedPrice = itemCost;
		}
	}

	return (
		<JetpackProductCardUpgradeNudge
			billingTimeFrame={ durationToText( selectorProductToUpgrade.term ) }
			currencyCode={ currencyCode }
			discountedPrice={ discountedPrice }
			originalPrice={ originalPrice }
			onUpgradeClick={ () => onClick( selectorProductToUpgrade ) }
			selectorProduct={ selectorProductToUpgrade }
		/>
	);
};

interface ProductCardProps {
	item: SelectorProduct;
	onClick: PurchaseCallback;
	siteId: number | null;
	currencyCode: string;
	className?: string;
}

const ProductCardWrapper = ( {
	item,
	onClick,
	siteId,
	currencyCode,
	className,
}: ProductCardProps ) => {
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

	let originalPrice = 0;
	let discountedPrice = undefined;
	if ( ! isFetchingPrices && itemCost ) {
		originalPrice = itemCost;
		if ( monthlyItemCost && item.term !== TERM_MONTHLY ) {
			originalPrice = monthlyItemCost * 12;
			discountedPrice = itemCost;
		}
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
			buttonLabel={ productButtonLabel( item, isOwned ) }
			badgeLabel={ productBadgeLabel( item, isOwned, sitePlan ) }
			onButtonClick={ () => onClick( item ) }
			features={ item.features }
			originalPrice={ originalPrice }
			discountedPrice={ discountedPrice }
			withStartingPrice={ item.subtypes.length > 0 }
			isOwned={ isOwned }
			isDeprecated={ item.legacy }
			className={ className }
			UpgradeNudge={
				<UpgradeNudgeWrapper item={ item } currencyCode={ currencyCode } onClick={ onClick } />
			}
		/>
	);
};

export default ProductCardWrapper;
