/**
 * External dependencies
 */
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PlanRenewalMessage from '../../plan-renewal-message';
import useItemPrice from '../../use-item-price';
import { productAboveButtonText, productButtonLabel, productTooltip } from '../../utils';
import {
	getForCurrentCROIteration,
	Iterations,
} from 'calypso/my-sites/plans/jetpack-plans/iterations';
import JetpackProductCardNPIP from 'calypso/components/jetpack/card/npip/jetpack-product-card-npip';
import JetpackProductCardI5 from 'calypso/components/jetpack/card/i5/jetpack-product-card-i5';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { planHasFeature } from 'calypso/lib/plans';
import { TERM_MONTHLY, TERM_ANNUALLY } from 'calypso/lib/plans/constants';
import {
	PRODUCT_JETPACK_CRM_MONTHLY,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
} from 'calypso/lib/products-values/constants';
import { isCloseToExpiration } from 'calypso/lib/purchases';
import { getPurchaseByProductSlug } from 'calypso/lib/purchases/utils';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSiteProducts from 'calypso/state/sites/selectors/get-site-products';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { getSiteAvailableProduct } from 'calypso/state/sites/products/selectors';
import { isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import { isJetpackPlanSlug } from 'calypso/lib/products-values/is-jetpack-plan-slug';

/**
 * Type dependencies
 */
import type { Duration, PurchaseCallback, SelectorProduct, SiteProduct } from '../../types';

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
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const JetpackProductCard = useMemo(
		() =>
			getForCurrentCROIteration( { [ Iterations.NPIP ]: JetpackProductCardNPIP } ) ||
			JetpackProductCardI5,
		[]
	);

	const sitePlan = useSelector( ( state ) => getSitePlan( state, siteId ) );
	const isMultisite = useSelector( ( state ) => siteId && isJetpackSiteMultiSite( state, siteId ) );
	const siteProducts = useSelector( ( state ) => getSiteProducts( state, siteId ) );
	const purchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const siteProduct: SiteProduct | undefined = useSelector( ( state ) =>
		getSiteAvailableProduct( state, siteId, item.productSlug )
	);

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
	const { originalPrice, discountedPrice, priceTiers } = useItemPrice(
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

	// Sets the currency. This is needed for the tooltip below.
	item.displayCurrency = item.displayCurrency ?? currencyCode ?? undefined;

	const isCrmMonthlyProduct = item.productSlug === PRODUCT_JETPACK_CRM_MONTHLY;

	const isMultisiteCompatible = useMemo( () => {
		if ( isJetpackPlanSlug( item.productSlug ) ) {
			// plans containing Jetpack Backup and/or Jetpack Scan are incompatible with multisite installs
			return ! [ ...JETPACK_BACKUP_PRODUCTS, ...JETPACK_SCAN_PRODUCTS ].filter( ( productSlug ) =>
				planHasFeature( item.productSlug, productSlug )
			).length;
		}
		return ! [ ...JETPACK_BACKUP_PRODUCTS, ...JETPACK_SCAN_PRODUCTS ].includes( item.productSlug );
	}, [ item.productSlug ] );

	// Disable the product card if it's an incompatible multisite product or CRM monthly product
	// (CRM is not offered with "Monthly" billing. Only Yearly.)
	const isDisabled = ( ( isMultisite && ! isMultisiteCompatible ) || isCrmMonthlyProduct ) ?? false;

	let disabledMessage;
	if ( isDisabled ) {
		if ( ! isMultisiteCompatible ) {
			disabledMessage = translate( 'Not available for multisite WordPress installs' );
		} else if ( isCrmMonthlyProduct ) {
			disabledMessage = translate( 'Only available in yearly billing' );
		}
	}

	return (
		<JetpackProductCard
			productSlug={ item.productSlug }
			productName={ item.displayName }
			headingLevel={ 3 }
			description={ showExpiryNotice && purchase ? <PlanRenewalMessage /> : item.description }
			currencyCode={ item.displayCurrency }
			originalPrice={ originalPrice }
			discountedPrice={ discountedPrice }
			billingTerm={ item.displayTerm || item.term }
			buttonLabel={ productButtonLabel( item, isOwned, isUpgradeableToYearly, sitePlan ) }
			buttonPrimary={ ! ( isOwned || isItemPlanFeature ) }
			onButtonClick={ () => onClick( item, isUpgradeableToYearly, purchase ) }
			expiryDate={ showExpiryNotice && purchase ? moment( purchase.expiryDate ) : undefined }
			isFeatured={ featuredPlans && featuredPlans.includes( item.productSlug ) }
			isOwned={ isOwned }
			isIncludedInPlan={ ! isOwned && isItemPlanFeature }
			isFree={ item.isFree }
			isDeprecated={ item.legacy }
			isAligned={ isAligned }
			features={ item.features }
			displayFrom={ ! siteId && priceTiers !== null }
			belowPriceText={ item.belowPriceText }
			tooltipText={ priceTiers && productTooltip( item, priceTiers ) }
			aboveButtonText={ productAboveButtonText( item, siteProduct, isOwned, isItemPlanFeature ) }
			isDisabled={ isDisabled }
			disabledMessage={ disabledMessage }
		/>
	);
};

export default ProductCardI5;
