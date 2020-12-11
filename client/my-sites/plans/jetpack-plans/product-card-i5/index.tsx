/**
 * External dependencies
 */
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getButtonLabelIteration } from '../_iterations';
import PlanRenewalMessage from '../plan-renewal-message';
import useItemPrice from '../use-item-price';
import { productButtonLabel } from '../utils';
import JetpackProductCard from 'calypso/components/jetpack/card/jetpack-product-card-i5';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { planHasFeature } from 'calypso/lib/plans';
import { TERM_MONTHLY, TERM_ANNUALLY } from 'calypso/lib/plans/constants';
import { isCloseToExpiration } from 'calypso/lib/purchases';
import { getPurchaseByProductSlug } from 'calypso/lib/purchases/utils';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSiteProducts from 'calypso/state/sites/selectors/get-site-products';
import { getSitePurchases } from 'calypso/state/purchases/selectors';

/**
 * Type dependencies
 */
import type { Duration, PurchaseCallback, SelectorProduct } from '../types';

interface ProductCardProps {
	item: SelectorProduct;
	onClick: PurchaseCallback;
	siteId: number | null;
	currencyCode: string | null;
	selectedTerm?: Duration;
	isAligned?: boolean;
	featuredPlans?: string[];
}

const ProductCardI5: React.FC< ProductCardProps > = ( {
	item,
	onClick,
	siteId,
	currencyCode,
	selectedTerm,
	isAligned,
	featuredPlans,
} ) => {
	const moment = useLocalizedMoment();

	const sitePlan = useSelector( ( state ) => getSitePlan( state, siteId ) );
	const siteProducts = useSelector( ( state ) => getSiteProducts( state, siteId ) );
	const purchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );

	// Determine whether product is owned.
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

	// If item is a plan feature, use the plan purchase object.
	const isItemPlanFeature = !! (
		sitePlan && planHasFeature( sitePlan.product_slug, item.productSlug )
	);
	const purchase = isItemPlanFeature
		? getPurchaseByProductSlug( purchases, sitePlan?.product_slug || '' )
		: getPurchaseByProductSlug( purchases, item.productSlug );

	// Handles expiry.
	const isExpiring = purchase && isCloseToExpiration( purchase );
	const showExpiryNotice = item.legacy && isExpiring;

	const isUpgradeableToYearly =
		isOwned && selectedTerm === TERM_ANNUALLY && item.term === TERM_MONTHLY;
	const ButtonLabelIteration = getButtonLabelIteration();

	return (
		<JetpackProductCard
			productSlug={ item.productSlug }
			productName={ item.displayName }
			headingLevel={ 3 }
			description={ showExpiryNotice && purchase ? <PlanRenewalMessage /> : item.description }
			currencyCode={ item.displayCurrency || currencyCode }
			originalPrice={ originalPrice }
			discountedPrice={ discountedPrice }
			billingTerm={ item.displayTerm || item.term }
			buttonLabel={
				ButtonLabelIteration ? (
					<ButtonLabelIteration />
				) : (
					productButtonLabel( item, isOwned, isUpgradeableToYearly, sitePlan )
				)
			}
			buttonPrimary={ ! ( isOwned || isItemPlanFeature ) }
			onButtonClick={ () => onClick( item, isUpgradeableToYearly, purchase ) }
			expiryDate={ showExpiryNotice && purchase ? moment( purchase.expiryDate ) : undefined }
			isFeatured={ featuredPlans && featuredPlans.includes( item.productSlug ) }
			isOwned={ isOwned }
			isDeprecated={ item.legacy }
			isAligned={ isAligned }
			features={ item.features }
		/>
	);
};

export default ProductCardI5;
