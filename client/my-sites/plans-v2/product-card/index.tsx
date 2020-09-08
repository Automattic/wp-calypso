/**
 * External dependencies
 */
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useMobileBreakpoint } from '@automattic/viewport-react';

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
	slugIsFeaturedProduct,
} from '../utils';
import PlanRenewalMessage from '../plan-renewal-message';
import useItemPrice from '../use-item-price';
import { getSitePurchases } from 'state/purchases/selectors';
import getSitePlan from 'state/sites/selectors/get-site-plan';
import getSiteProducts from 'state/sites/selectors/get-site-products';
import { useLocalizedMoment } from 'components/localized-moment';
import JetpackPlanCard from 'components/jetpack/card/jetpack-plan-card';
import JetpackBundleCard from 'components/jetpack/card/jetpack-bundle-card';
import JetpackProductCard from 'components/jetpack/card/jetpack-product-card';
import JetpackProductCardUpgradeNudge from 'components/jetpack/card/jetpack-product-card/upgrade-nudge';
import { planHasFeature } from 'lib/plans';
import { JETPACK_SEARCH_PRODUCTS } from 'lib/products-values/constants';
import { isCloseToExpiration } from 'lib/purchases';
import { getPurchaseByProductSlug } from 'lib/purchases/utils';

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
	siteId: number | null;
	item: SelectorProduct;
	currencyCode: string | null;
	onClick: PurchaseCallback;
}

const UpgradeNudgeWrapper = ( { siteId, item, currencyCode, onClick }: UpgradeNudgeProps ) => {
	const upgradeToProductSlug =
		getRealtimeFromDaily( item.costProductSlug || item.productSlug ) || '';
	const selectorProductToUpgrade = slugToSelectorProduct( upgradeToProductSlug );

	const { isFetching, originalPrice, discountedPrice } = useItemPrice(
		siteId,
		selectorProductToUpgrade,
		selectorProductToUpgrade?.monthlyProductSlug || ''
	);

	if ( ! isUpgradeable( item.productSlug ) || isFetching || ! selectorProductToUpgrade ) {
		return null;
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
	currencyCode: string | null;
	className?: string;
	highlight?: boolean;
}

const ProductCardWrapper = ( {
	item,
	onClick,
	siteId,
	currencyCode,
	className,
	highlight = false,
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
	const { originalPrice, discountedPrice } = useItemPrice(
		siteId,
		item,
		item?.monthlyProductSlug || ''
	);

	// Handles expiry.
	const moment = useLocalizedMoment();
	const purchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );

	// If item is a plan feature, use the plan purchase object.
	const isItemPlanFeature = sitePlan && planHasFeature( sitePlan.product_slug, item.productSlug );
	const purchase = isItemPlanFeature
		? getPurchaseByProductSlug( purchases, sitePlan?.product_slug || '' )
		: getPurchaseByProductSlug( purchases, item.productSlug );

	const isExpiring = purchase && isCloseToExpiration( purchase );
	const showExpiryNotice = item.legacy && isExpiring;

	// Is highlighted?
	const isMobile: boolean = useMobileBreakpoint();
	const isHighlighted = highlight && ! isOwned && slugIsFeaturedProduct( item.productSlug );

	const CardComponent = itemToCard( item ); // Get correct card component.

	const UpgradeNudge = isOwned ? (
		<UpgradeNudgeWrapper
			siteId={ siteId }
			item={ item }
			currencyCode={ currencyCode }
			onClick={ onClick }
		/>
	) : null;
	return (
		<CardComponent
			headingLevel={ 3 }
			iconSlug={ item.iconSlug }
			productName={ item.displayName }
			subheadline={ item.tagline }
			description={
				showExpiryNotice && purchase ? (
					<PlanRenewalMessage purchase={ purchase } />
				) : (
					item.description
				)
			}
			currencyCode={ currencyCode }
			billingTimeFrame={ durationToText( item.term ) }
			buttonLabel={ productButtonLabel( item, isOwned, sitePlan ) }
			badgeLabel={ productBadgeLabel( item, isOwned, highlight, sitePlan ) }
			onButtonClick={ () => onClick( item, purchase ) }
			features={ item.features }
			children={ item.children }
			originalPrice={ originalPrice }
			discountedPrice={ discountedPrice }
			withStartingPrice={
				// Search has several pricing tiers
				item.subtypes.length > 0 || JETPACK_SEARCH_PRODUCTS.includes( item.product_slug )
			}
			isOwned={ isOwned }
			isDeprecated={ item.legacy }
			className={ className }
			UpgradeNudge={ UpgradeNudge }
			expiryDate={ showExpiryNotice && purchase ? moment( purchase.expiryDate ) : undefined }
			isHighlighted={ isHighlighted }
			isExpanded={ isHighlighted && ! isMobile }
			hidePrice={
				// Don't hide price if siteId is not defined, since it most likely won't be shown
				// in other parts of the card (e.g. Jetpack Search)
				siteId && item.hidePrice
			}
		/>
	);
};

export default ProductCardWrapper;
