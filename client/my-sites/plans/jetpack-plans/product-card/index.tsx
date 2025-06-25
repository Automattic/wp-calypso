import {
	planHasFeature,
	TERM_MONTHLY,
	TERM_ANNUALLY,
	PRODUCT_JETPACK_CRM_MONTHLY,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	isJetpackPlanSlug,
	isSupersedingJetpackItem,
	type JetpackPurchasableItemSlug,
} from '@automattic/calypso-products';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import * as React from 'react';
import JetpackProductCard from 'calypso/components/jetpack/card/jetpack-product-card';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { isCloseToExpiration } from 'calypso/lib/purchases';
import { getPurchaseByProductSlug } from 'calypso/lib/purchases/utils';
import OwnerInfo from 'calypso/me/purchases/purchase-item/owner-info';
import { ITEM_TYPE_PLAN } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { useSelector } from 'calypso/state';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { useIsUserPurchaseOwner } from 'calypso/state/purchases/utils';
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
	isFeatured?: boolean;
	featuredLabel?: TranslateResult;
	hideSavingLabel?: boolean;
	scrollCardIntoView?: ScrollCardIntoViewCallback;
	collapseFeaturesOnMobile?: boolean;
	isLoadingUpsellPageExperiment?: boolean;
}

const ProductCard: React.FC< ProductCardProps > = ( {
	item,
	onClick,
	createButtonURL,
	siteId,
	currencyCode,
	selectedTerm,
	isAligned,
	isFeatured,
	featuredLabel,
	hideSavingLabel,
	scrollCardIntoView,
	collapseFeaturesOnMobile,
	isLoadingUpsellPageExperiment,
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
	const isCurrentUserPurchaseOwner = useIsUserPurchaseOwner();

	const jetpackUpgradesLocked = purchases.some( ( purchase ) => purchase.isLocked );
	const existingPurchaseIsIapPurchase = purchases.some( ( purchase ) => purchase.isInAppPurchase );

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
	const {
		originalPrice,
		discountedPrice,
		priceTierList,
		isFetching: pricesAreFetching,
	} = useItemPrice( siteId, item, item?.monthlyProductSlug || '' );

	const isItemPlanFeature = !! (
		sitePlan && planHasFeature( sitePlan.product_slug, item.productSlug )
	);

	const isDeprecated = Boolean( item.legacy );
	const isIncludedInPlan = ! isOwned && isItemPlanFeature;
	const isSuperseded = !! (
		! isDeprecated &&
		! isOwned &&
		! isIncludedInPlan &&
		sitePlan &&
		item &&
		isSupersedingJetpackItem(
			sitePlan.product_slug as JetpackPurchasableItemSlug,
			item.productSlug as JetpackPurchasableItemSlug
		)
	);

	// If item is a plan feature, use the plan purchase object.
	const purchase =
		isItemPlanFeature || isSuperseded
			? getPurchaseByProductSlug( purchases, sitePlan?.product_slug || '' )
			: getPurchaseByProductSlug( purchases, item.productSlug );

	const isNotPlanOwner = ! isCurrentUserPurchaseOwner( purchase );

	// Handles expiry.
	const isExpiring = purchase && isCloseToExpiration( purchase );
	const showExpiryNotice = item.legacy && isExpiring;

	const isUpgradeableToYearly =
		isOwned &&
		selectedTerm === TERM_ANNUALLY &&
		item.term === TERM_MONTHLY &&
		! item.forceNoYearlyUpgrade;

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
		return ! (
			[ ...JETPACK_BACKUP_PRODUCTS, ...JETPACK_SCAN_PRODUCTS ] as ReadonlyArray< string >
		 ).includes( item.productSlug );
	}, [ item.productSlug ] );

	/**
	 * Disable the product card if:
	 * - It is an incompatible multisite product
	 * - It is a CRM monthly product (CRM is not offered with "Monthly" billing, only "Yearly")
	 * - The user is not the owner of the plan
	 * - The item is a plan which is an upgrade of an existing plan that is locked for management (e.g. IAP)
	 */
	const isDisabled =
		( ( isMultisite && ! isMultisiteCompatible ) ||
			isCrmMonthlyProduct ||
			( ! purchase && item.type === ITEM_TYPE_PLAN && jetpackUpgradesLocked ) ) ??
		false;

	// Disable the button CTA if the overall product card is disabled, or disable
	//  the "Manage Plan/Subscription" button if the user is not the purchase owner.
	const buttonDisabled = isOwned || isIncludedInPlan ? isDisabled || isNotPlanOwner : isDisabled;

	let disabledMessage;
	if ( isDisabled ) {
		if ( ! isMultisiteCompatible && ! isDeprecated ) {
			disabledMessage = translate( 'Not available for multisite WordPress installs' );
		} else if ( isCrmMonthlyProduct ) {
			disabledMessage = translate( 'Only available in yearly billing' );
		}
	}

	if ( isDisabled && existingPurchaseIsIapPurchase ) {
		disabledMessage = translate( 'You can upgrade to %(planName)s through the Jetpack app', {
			args: {
				planName: item.shortName,
			},
		} );
	}

	let buttonLabel = productButtonLabel( {
		product: item,
		isOwned,
		isUpgradeableToYearly,
		isDeprecated,
		isSuperseded,
		currentPlan: sitePlan,
	} );

	buttonLabel = purchase ? (
		<>
			{ buttonLabel }
			&nbsp;
			<OwnerInfo purchase={ purchase } />
		</>
	) : (
		buttonLabel
	);

	return (
		<JetpackProductCard
			item={ item }
			headerLevel={ 3 }
			description={ showExpiryNotice && purchase ? <PlanRenewalMessage /> : item.description }
			originalPrice={ originalPrice }
			discountedPrice={ discountedPrice }
			buttonLabel={ buttonLabel }
			buttonPrimary={ ! ( isOwned || isItemPlanFeature || isSuperseded ) }
			onButtonClick={ () => {
				onClick( item, isUpgradeableToYearly, purchase );
			} }
			buttonURL={
				createButtonURL ? createButtonURL( item, isUpgradeableToYearly, purchase ) : undefined
			}
			buttonDisabled={ isDisabled || buttonDisabled || isLoadingUpsellPageExperiment }
			expiryDate={ showExpiryNotice && purchase ? moment( purchase.expiryDate ) : undefined }
			isFeatured={ isFeatured }
			isOwned={ isOwned }
			isIncludedInPlan={ isIncludedInPlan || isSuperseded }
			isDeprecated={ isDeprecated }
			isAligned={ isAligned }
			displayFrom={ ! siteId && priceTierList.length > 0 }
			tooltipText={
				priceTierList.length > 0 && productTooltip( item, priceTierList, currencyCode ?? 'USD' )
			}
			aboveButtonText={ productAboveButtonText( item, siteProduct, isOwned, isItemPlanFeature ) }
			isDisabled={ isDisabled }
			disabledMessage={ disabledMessage }
			featuredLabel={ featuredLabel }
			hideSavingLabel={ hideSavingLabel }
			scrollCardIntoView={ scrollCardIntoView }
			collapseFeaturesOnMobile={ collapseFeaturesOnMobile }
			pricesAreFetching={ pricesAreFetching }
		/>
	);
};

export default ProductCard;
