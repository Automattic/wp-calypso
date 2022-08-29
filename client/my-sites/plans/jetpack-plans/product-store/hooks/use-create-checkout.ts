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
import { getSitePlan, getSiteProducts } from 'calypso/state/sites/selectors';
import { SelectorProduct } from '../../types';
import { CreateCheckoutURLProps } from '../types';

export const useCreateCheckout = ( {
	createCheckoutURL,
	duration: selectedTerm,
	onClickPurchase,
	siteId,
}: CreateCheckoutURLProps ) => {
	const sitePlan = useSelector( ( state ) => getSitePlan( state, siteId ) );
	const siteProducts = useSelector( ( state ) => getSiteProducts( state, siteId ) );
	const purchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );

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

	const getPurchase = useCallback(
		( item: SelectorProduct ) => {
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

			return purchase;
		},
		[ isOwned, purchases, sitePlan ]
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

	return useMemo(
		() => ( {
			getCheckoutURL,
			getOnClickPurchase,
			isOwned,
		} ),
		[ getCheckoutURL, getOnClickPurchase, isOwned ]
	);
};
