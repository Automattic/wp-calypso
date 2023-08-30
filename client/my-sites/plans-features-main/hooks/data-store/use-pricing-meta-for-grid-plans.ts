import { WpcomPlansUI } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useSelector } from 'react-redux';
import { AddOnMeta } from 'calypso/my-sites/add-ons/hooks/use-add-ons';
import usePricedAPIPlans from 'calypso/my-sites/plans-features-main/hooks/data-store/use-priced-api-plans';
import { getPlanPrices } from 'calypso/state/plans/selectors';
import {
	getSitePlanRawPrice,
	isPlanAvailableForPurchase,
} from 'calypso/state/sites/plans/selectors';
import getSitePlanSlug from 'calypso/state/sites/selectors/get-site-plan-slug';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import type { PlanSlug } from '@automattic/calypso-products';
import type {
	UsePricingMetaForGridPlans,
	PricingMetaForGridPlan,
} from 'calypso/my-sites/plan-features-2023-grid/hooks/npm-ready/data-store/use-grid-plans';
import type { IAppState } from 'calypso/state/types';

interface Props {
	planSlugs: PlanSlug[];
	withoutProRatedCredits?: boolean;
	storageAddOns?: AddOnMeta[];
}

/*
 * Returns the pricing metadata needed for the plans-ui components.
 * - see PricingMetaForGridPlan type for details
 * - will migrate to data-store once dependencies are resolved (when site & plans data-stores more complete)
 */
const usePricingMetaForGridPlans: UsePricingMetaForGridPlans = ( {
	planSlugs,
	withoutProRatedCredits = false,
	storageAddOns = [],
}: Props ) => {
	const pricedAPIPlans = usePricedAPIPlans( { planSlugs: planSlugs } );
	const selectedStorageOptions = useSelect( ( select ) => {
		return select( WpcomPlansUI.store ).getSelectedStorageOptions();
	}, [] );
	const planPrices = useSelector( ( state: IAppState ) => {
		return planSlugs.reduce( ( acc, planSlug ) => {
			const selectedSiteId = getSelectedSiteId( state );
			const currentSitePlanSlug = getSitePlanSlug( state, selectedSiteId );
			const availableForPurchase =
				! currentSitePlanSlug ||
				( selectedSiteId ? isPlanAvailableForPurchase( state, selectedSiteId, planSlug ) : false );
			const selectedStorageOption = selectedStorageOptions?.[ planSlug ];
			const storageAddOnCost = storageAddOns.find( ( addOn ) => {
				return addOn?.featureSlugs?.includes( selectedStorageOption || '' );
			} )?.costData;
			const storageAddOnPriceMonthly = storageAddOnCost?.monthlyCost || 0;
			const storageAddOnPriceYearly = storageAddOnCost?.yearlyCost || 0;

			const planPricesMonthly = getPlanPrices( state, {
				planSlug,
				siteId: selectedSiteId || null,
				returnMonthly: true,
			} );
			const planPricesFull = getPlanPrices( state, {
				planSlug,
				siteId: selectedSiteId || null,
				returnMonthly: false,
			} );

			// raw prices for current site's plan
			if ( selectedSiteId && currentSitePlanSlug === planSlug ) {
				return {
					...acc,
					[ planSlug ]: {
						originalPrice: {
							monthly:
								getSitePlanRawPrice( state, selectedSiteId, planSlug, {
									returnMonthly: true,
								} ) + storageAddOnCost?.monthlyPrice,
							full:
								getSitePlanRawPrice( state, selectedSiteId, planSlug, {
									returnMonthly: false,
								} ) + storageAddOnCost?.yearlyPrice,
						},
						discountedPrice: {
							monthly: null,
							full: null,
						},
					},
				};
			}

			// raw prices for plan not available for purchase
			if ( ! availableForPurchase ) {
				return {
					...acc,
					[ planSlug ]: {
						originalPrice: {
							monthly: planPricesMonthly.rawPrice,
							full: planPricesFull.rawPrice,
						},
						discountedPrice: {
							monthly: null,
							full: null,
						},
					},
				};
			}

			// raw prices with discounts for plan available for purchase
			return {
				...acc,
				[ planSlug ]: {
					originalPrice: {
						monthly: planPricesMonthly.rawPrice + storageAddOnPriceMonthly,
						full: planPricesFull.rawPrice + storageAddOnPriceYearly,
					},
					discountedPrice: {
						monthly: withoutProRatedCredits
							? planPricesMonthly.discountedRawPrice + storageAddOnPriceMonthly
							: ( planPricesMonthly.planDiscountedRawPrice ||
									planPricesMonthly.discountedRawPrice ) + storageAddOnPriceMonthly,
						full: withoutProRatedCredits
							? planPricesFull.discountedRawPrice + storageAddOnPriceYearly
							: ( planPricesFull.planDiscountedRawPrice || planPricesFull.discountedRawPrice ) +
							  storageAddOnPriceYearly,
					},
				},
			};
		}, {} as { [ planSlug: string ]: Pick< PricingMetaForGridPlan, 'originalPrice' | 'discountedPrice' > } );
	} );

	return planSlugs.reduce(
		( acc, planSlug ) => ( {
			...acc,
			[ planSlug ]: {
				originalPrice: planPrices[ planSlug ]?.originalPrice,
				discountedPrice: planPrices[ planSlug ]?.discountedPrice,
				billingPeriod: pricedAPIPlans[ planSlug ]?.bill_period,
				currencyCode: pricedAPIPlans[ planSlug ]?.currency_code,
			},
		} ),
		{} as { [ planSlug: string ]: PricingMetaForGridPlan }
	);
};

export default usePricingMetaForGridPlans;
