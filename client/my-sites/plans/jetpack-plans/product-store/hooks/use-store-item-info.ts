import {
	JetpackPurchasableItemSlug,
	planHasFeature,
	TERM_ANNUALLY,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import isSupersedingJetpackItem from 'calypso/../packages/calypso-products/src/is-superseding-jetpack-item';
import { getPurchaseByProductSlug } from 'calypso/lib/purchases/utils';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { useIsUserPurchaseOwner } from 'calypso/state/purchases/utils';
import { getSitePlan, getSiteProducts } from 'calypso/state/sites/selectors';
import { SelectorProduct } from '../../types';
import { UseStoreItemInfoProps } from '../types';

const isDeprecated = ( item: SelectorProduct ) => Boolean( item.legacy );

export const useStoreItemInfo = ( {
	createCheckoutURL,
	duration: selectedTerm,
	onClickPurchase,
	siteId,
}: UseStoreItemInfoProps ) => {
	const sitePlan = useSelector( ( state ) => getSitePlan( state, siteId ) );
	const siteProducts = useSelector( ( state ) => getSiteProducts( state, siteId ) );
	const purchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const isCurrentUserPurchaseOwner = useIsUserPurchaseOwner();

	// Determine whether product is owned.
	const isOwned = useCallback(
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

	const isUpgradeableToYearly = useCallback(
		( item: SelectorProduct ) =>
			isOwned( item ) && selectedTerm === TERM_ANNUALLY && item.term === TERM_MONTHLY,
		[ isOwned, selectedTerm ]
	);

	const isPlanFeature = useCallback(
		( item: SelectorProduct ) =>
			!! ( sitePlan && planHasFeature( sitePlan.product_slug, item.productSlug ) ),
		[ sitePlan ]
	);

	const isIncludedInPlan = useCallback(
		( item: SelectorProduct ) => {
			return ! isOwned( item ) && isPlanFeature( item );
		},
		[ isOwned, isPlanFeature ]
	);

	const isSuperseded = useCallback(
		( item: SelectorProduct ) => {
			return !! (
				! isDeprecated( item ) &&
				! isOwned( item ) &&
				! isIncludedInPlan( item ) &&
				sitePlan &&
				item &&
				isSupersedingJetpackItem(
					sitePlan.product_slug as JetpackPurchasableItemSlug,
					item.productSlug as JetpackPurchasableItemSlug
				)
			);
		},
		[ isIncludedInPlan, isOwned, sitePlan ]
	);

	const isIncludedInPlanOrSuperseded = useCallback(
		( item: SelectorProduct ) => isIncludedInPlan( item ) || isSuperseded( item ),
		[ isIncludedInPlan, isSuperseded ]
	);

	const getPurchase = useCallback(
		( item: SelectorProduct ) => {
			const isItemPlanFeature = isPlanFeature( item );

			const isItemSuperseded = isSuperseded( item );

			// If item is a plan feature, use the plan purchase object.
			const purchase =
				isItemPlanFeature || isItemSuperseded
					? getPurchaseByProductSlug( purchases, sitePlan?.product_slug || '' )
					: getPurchaseByProductSlug( purchases, item.productSlug );

			return purchase;
		},
		[ isPlanFeature, isSuperseded, purchases, sitePlan?.product_slug ]
	);

	const getCheckoutURL = useCallback(
		( item: SelectorProduct ) => {
			return createCheckoutURL?.( item, isUpgradeableToYearly( item ), getPurchase( item ) );
		},
		[ createCheckoutURL, getPurchase, isUpgradeableToYearly ]
	);

	const getOnClickPurchase = useCallback(
		( item: SelectorProduct ) => () => {
			return onClickPurchase?.( item, isUpgradeableToYearly( item ), getPurchase( item ) );
		},
		[ getPurchase, isUpgradeableToYearly, onClickPurchase ]
	);

	const isUserPurchaseOwner = useCallback(
		( item: SelectorProduct ) => {
			const purchase = getPurchase( item );
			return isCurrentUserPurchaseOwner( purchase );
		},
		[ getPurchase, isCurrentUserPurchaseOwner ]
	);

	return useMemo(
		() => ( {
			getCheckoutURL,
			getOnClickPurchase,
			getPurchase,
			isDeprecated,
			isIncludedInPlan,
			isIncludedInPlanOrSuperseded,
			isOwned,
			isPlanFeature,
			isSuperseded,
			isUpgradeableToYearly,
			isUserPurchaseOwner,
			sitePlan,
		} ),
		[
			getCheckoutURL,
			getOnClickPurchase,
			getPurchase,
			isIncludedInPlan,
			isIncludedInPlanOrSuperseded,
			isOwned,
			isPlanFeature,
			isSuperseded,
			isUpgradeableToYearly,
			isUserPurchaseOwner,
			sitePlan,
		]
	);
};
