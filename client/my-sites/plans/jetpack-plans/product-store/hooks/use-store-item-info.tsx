import {
	isJetpackPlanSlug,
	JetpackPurchasableItemSlug,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	planHasFeature,
	TERM_ANNUALLY,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import isSupersedingJetpackItem from 'calypso/../packages/calypso-products/src/is-superseding-jetpack-item';
import { getPurchaseByProductSlug } from 'calypso/lib/purchases/utils';
import OwnerInfo from 'calypso/me/purchases/purchase-item/owner-info';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { useIsUserPurchaseOwner } from 'calypso/state/purchases/utils';
import {
	getSitePlan,
	getSiteProducts,
	isJetpackSiteMultiSite,
} from 'calypso/state/sites/selectors';
import productButtonLabel from '../../product-card/product-button-label';
import { SelectorProduct } from '../../types';
import { UseStoreItemInfoProps } from '../types';

const getIsDeprecated = ( item: SelectorProduct ) => Boolean( item.legacy );

const getIsMultisiteCompatible = ( item: SelectorProduct ) => {
	if ( isJetpackPlanSlug( item.productSlug ) ) {
		// plans containing Jetpack Backup and/or Jetpack Scan are incompatible with multisite installs
		return ! [ ...JETPACK_BACKUP_PRODUCTS, ...JETPACK_SCAN_PRODUCTS ].filter( ( productSlug ) =>
			planHasFeature( item.productSlug, productSlug )
		).length;
	}
	return ! (
		[ ...JETPACK_BACKUP_PRODUCTS, ...JETPACK_SCAN_PRODUCTS ] as ReadonlyArray< string >
	 ).includes( item.productSlug );
};

export const useStoreItemInfo = ( {
	createCheckoutURL,
	duration: selectedTerm,
	onClickPurchase,
	siteId,
}: UseStoreItemInfoProps ) => {
	const sitePlan = useSelector( ( state ) => getSitePlan( state, siteId ) );
	const siteProducts = useSelector( ( state ) => getSiteProducts( state, siteId ) );
	const purchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const isMultisite = useSelector(
		( state ) => !! ( siteId && isJetpackSiteMultiSite( state, siteId ) )
	);

	const isCurrentUserPurchaseOwner = useIsUserPurchaseOwner();
	const translate = useTranslate();

	// Determine whether product is owned.
	const getIsOwned = useCallback(
		( item: SelectorProduct ) => {
			if ( sitePlan && sitePlan.product_slug === item.productSlug ) {
				return true;
			} else if ( siteProducts ) {
				return siteProducts
					.filter( ( product ) => ! product.expired )
					.map( ( product ) => product.productSlug )
					.includes( item.productSlug );
			}
			return false;
		},
		[ sitePlan, siteProducts ]
	);

	const getIsUpgradeableToYearly = useCallback(
		( item: SelectorProduct ) =>
			getIsOwned( item ) && selectedTerm === TERM_ANNUALLY && item.term === TERM_MONTHLY,
		[ getIsOwned, selectedTerm ]
	);

	const getIsPlanFeature = useCallback(
		( item: SelectorProduct ) =>
			!! ( sitePlan && planHasFeature( sitePlan.product_slug, item.productSlug ) ),
		[ sitePlan ]
	);

	const getIsIncludedInPlan = useCallback(
		( item: SelectorProduct ) => {
			return ! getIsOwned( item ) && getIsPlanFeature( item );
		},
		[ getIsOwned, getIsPlanFeature ]
	);

	const getIsSuperseded = useCallback(
		( item: SelectorProduct ) => {
			return !! (
				! getIsDeprecated( item ) &&
				! getIsOwned( item ) &&
				! getIsIncludedInPlan( item ) &&
				sitePlan &&
				item &&
				isSupersedingJetpackItem(
					sitePlan.product_slug as JetpackPurchasableItemSlug,
					item.productSlug as JetpackPurchasableItemSlug
				)
			);
		},
		[ getIsIncludedInPlan, getIsOwned, sitePlan ]
	);

	const getIsIncludedInPlanOrSuperseded = useCallback(
		( item: SelectorProduct ) => getIsIncludedInPlan( item ) || getIsSuperseded( item ),
		[ getIsIncludedInPlan, getIsSuperseded ]
	);

	const getPurchase = useCallback(
		( item: SelectorProduct ) => {
			const isPlanFeature = getIsPlanFeature( item );

			const isSuperseded = getIsSuperseded( item );

			// If item is a plan feature, use the plan purchase object.
			const purchase =
				isPlanFeature || isSuperseded
					? getPurchaseByProductSlug( purchases, sitePlan?.product_slug || '' )
					: getPurchaseByProductSlug( purchases, item.productSlug );

			return purchase;
		},
		[ getIsPlanFeature, getIsSuperseded, purchases, sitePlan?.product_slug ]
	);

	const getCheckoutURL = useCallback(
		( item: SelectorProduct ) => {
			return createCheckoutURL?.( item, getIsUpgradeableToYearly( item ), getPurchase( item ) );
		},
		[ createCheckoutURL, getPurchase, getIsUpgradeableToYearly ]
	);

	const getOnClickPurchase = useCallback(
		( item: SelectorProduct ) => () => {
			return onClickPurchase?.( item, getIsUpgradeableToYearly( item ), getPurchase( item ) );
		},
		[ getPurchase, getIsUpgradeableToYearly, onClickPurchase ]
	);

	const getIsUserPurchaseOwner = useCallback(
		( item: SelectorProduct ) => {
			const purchase = getPurchase( item );
			return isCurrentUserPurchaseOwner( purchase );
		},
		[ getPurchase, isCurrentUserPurchaseOwner ]
	);

	const getCtaLabel = useCallback(
		( item: SelectorProduct ) => {
			const ctaLabel = productButtonLabel( {
				product: item,
				isOwned: getIsOwned( item ),
				isUpgradeableToYearly: getIsUpgradeableToYearly( item ),
				isDeprecated: getIsDeprecated( item ),
				isSuperseded: getIsSuperseded( item ),
				currentPlan: sitePlan,
				fallbackLabel: translate( 'Get' ),
			} );

			const purchase = getPurchase( item );

			if ( ! purchase || isCurrentUserPurchaseOwner( purchase ) ) {
				return ctaLabel;
			}

			return (
				<>
					{ ctaLabel }
					&nbsp;
					<OwnerInfo purchase={ purchase } />
				</>
			);
		},
		[
			getIsOwned,
			getIsUpgradeableToYearly,
			getIsSuperseded,
			sitePlan,
			translate,
			getPurchase,
			isCurrentUserPurchaseOwner,
		]
	);

	return useMemo(
		() => ( {
			getCheckoutURL,
			getCtaLabel,
			getIsDeprecated,
			getIsIncludedInPlan,
			getIsIncludedInPlanOrSuperseded,
			getIsMultisiteCompatible,
			getIsOwned,
			getIsPlanFeature,
			getIsSuperseded,
			getIsUpgradeableToYearly,
			getIsUserPurchaseOwner,
			getOnClickPurchase,
			getPurchase,
			isMultisite,
		} ),
		[
			getCheckoutURL,
			getCtaLabel,
			getIsIncludedInPlan,
			getIsIncludedInPlanOrSuperseded,
			getIsOwned,
			getIsPlanFeature,
			getIsSuperseded,
			getIsUpgradeableToYearly,
			getIsUserPurchaseOwner,
			getOnClickPurchase,
			getPurchase,
			isMultisite,
		]
	);
};
