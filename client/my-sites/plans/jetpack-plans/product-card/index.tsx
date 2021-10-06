import {
	planHasFeature,
	TERM_MONTHLY,
	TERM_ANNUALLY,
	PRODUCT_JETPACK_CRM_MONTHLY,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	isJetpackPlanSlug,
} from '@automattic/calypso-products';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import * as React from 'react';
import { useSelector } from 'react-redux';
import JetpackProductCard from 'calypso/components/jetpack/card/jetpack-product-card';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { isCloseToExpiration } from 'calypso/lib/purchases';
import { getPurchaseByProductSlug } from 'calypso/lib/purchases/utils';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { getSiteAvailableProduct } from 'calypso/state/sites/products/selectors';
import { isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSiteProducts from 'calypso/state/sites/selectors/get-site-products';
import PlanRenewalMessage from '../plan-renewal-message';
import useItemPrice from '../use-item-price';
import productAboveButtonText from './product-above-button-text';
import productButtonLabel from './product-button-label';
import productTooltip from './product-tooltip';
import type {
	Duration,
	PurchaseCallback,
	PurchaseURLCallback,
	ScrollCardIntoViewCallback,
	SelectorProduct,
	SiteProduct,
} from '../types';

interface ProductCardProps {
	item: SelectorProduct;
	onClick: PurchaseCallback;
	createButtonURL?: PurchaseURLCallback;
	siteId: number | null;
	currencyCode: string | null;
	selectedTerm?: Duration;
	isAligned?: boolean;
	featuredPlans?: string[];
	featuredLabel?: TranslateResult;
	hideSavingLabel?: boolean;
	scrollCardIntoView: ScrollCardIntoViewCallback;
}

const ProductCard: React.FC< ProductCardProps > = ( {
	item,
	onClick,
	createButtonURL,
	siteId,
	currencyCode,
	selectedTerm,
	isAligned,
	featuredPlans,
	featuredLabel,
	hideSavingLabel,
	scrollCardIntoView,
} ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

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
	const { originalPrice, discountedPrice, priceTierList } = useItemPrice(
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

	const isDeprecated = Boolean( item.legacy );

	// Disable the product card if it's an incompatible multisite product or CRM monthly product
	// (CRM is not offered with "Monthly" billing. Only Yearly.)
	const isDisabled = ( ( isMultisite && ! isMultisiteCompatible ) || isCrmMonthlyProduct ) ?? false;

	let disabledMessage;
	if ( isDisabled ) {
		if ( ! isMultisiteCompatible && ! isDeprecated ) {
			disabledMessage = translate( 'Not available for multisite WordPress installs' );
		} else if ( isCrmMonthlyProduct ) {
			disabledMessage = translate( 'Only available in yearly billing' );
		}
	}

	return (
		<JetpackProductCard
			item={ item }
			headingLevel={ 3 }
			description={ showExpiryNotice && purchase ? <PlanRenewalMessage /> : item.description }
			originalPrice={ originalPrice }
			discountedPrice={ discountedPrice }
			buttonLabel={ productButtonLabel( {
				product: item,
				isOwned,
				isUpgradeableToYearly,
				isDeprecated,
				currentPlan: sitePlan,
			} ) }
			buttonPrimary={ ! ( isOwned || isItemPlanFeature ) }
			onButtonClick={ () => {
				onClick( item, isUpgradeableToYearly, purchase );
			} }
			buttonURL={
				createButtonURL ? createButtonURL( item, isUpgradeableToYearly, purchase ) : undefined
			}
			expiryDate={ showExpiryNotice && purchase ? moment( purchase.expiryDate ) : undefined }
			isFeatured={ featuredPlans && featuredPlans.includes( item.productSlug ) }
			isOwned={ isOwned }
			isIncludedInPlan={ ! isOwned && isItemPlanFeature }
			isDeprecated={ isDeprecated }
			isAligned={ isAligned }
			displayFrom={ ! siteId && priceTierList.length > 0 }
			tooltipText={ priceTierList.length > 0 && productTooltip( item, priceTierList ) }
			aboveButtonText={ productAboveButtonText( item, siteProduct, isOwned, isItemPlanFeature ) }
			isDisabled={ isDisabled }
			disabledMessage={ disabledMessage }
			featuredLabel={ featuredLabel }
			hideSavingLabel={ hideSavingLabel }
			scrollCardIntoView={ scrollCardIntoView }
		/>
	);
};

export default ProductCard;
