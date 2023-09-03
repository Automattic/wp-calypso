import { AddOnMeta, WpcomPlansUI } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useSelector } from 'react-redux';
import usePricedAPIPlans from 'calypso/my-sites/plans-features-main/hooks/data-store/use-priced-api-plans';
import { getPlanPrices } from 'calypso/state/plans/selectors';
import { PlanPrices } from 'calypso/state/plans/types';
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
	storageAddOns?: ( AddOnMeta | null )[] | null;
}

function getTotalPrices( planPrices: PlanPrices, addOnPrice = 0 ): PlanPrices {
	const totalPrices = { ...planPrices };
	let key: keyof PlanPrices;

	for ( key in totalPrices ) {
		const price = totalPrices[ key ];

		if ( ! ( price === null ) ) {
			totalPrices[ key ] = price + addOnPrice;
		}
	}

	return totalPrices;
}

/*
 * Returns the pricing metadata needed for the plans-ui components.
 * - see PricingMetaForGridPlan type for details
 * - will migrate to data-store once dependencies are resolved (when site & plans data-stores more complete)
 */

const usePricingMetaForGridPlans: UsePricingMetaForGridPlans = ( {
	planSlugs,
	withoutProRatedCredits = false,
	storageAddOns,
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
			const storageAddOnPrices = storageAddOns?.find( ( addOn ) => {
				return addOn?.featureSlugs?.includes( selectedStorageOption || '' );
			} )?.prices;
			const storageAddOnPriceMonthly = storageAddOnPrices?.monthlyPrice || 0;
			const storageAddOnPriceYearly = storageAddOnPrices?.yearlyPrice || 0;

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
			const totalPricesMonthly = getTotalPrices( planPricesMonthly, storageAddOnPriceMonthly );
			const totalPricesFull = getTotalPrices( planPricesFull, storageAddOnPriceYearly );

			// raw prices for current site's plan
			if ( selectedSiteId && currentSitePlanSlug === planSlug ) {
				const monthlyPrice = getSitePlanRawPrice( state, selectedSiteId, planSlug, {
					returnMonthly: true,
				} );
				const yearlyPrice = getSitePlanRawPrice( state, selectedSiteId, planSlug, {
					returnMonthly: false,
				} );

				return {
					...acc,
					[ planSlug ]: {
						originalPrice: {
							monthly: monthlyPrice ? monthlyPrice + storageAddOnPriceMonthly : null,
							full: yearlyPrice ? yearlyPrice + storageAddOnPriceYearly : null,
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
							monthly: totalPricesMonthly.rawPrice,
							full: totalPricesFull.rawPrice,
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
						monthly: totalPricesMonthly.rawPrice,
						full: totalPricesFull.rawPrice,
					},
					discountedPrice: {
						monthly: withoutProRatedCredits
							? totalPricesMonthly.discountedRawPrice
							: totalPricesMonthly.planDiscountedRawPrice || totalPricesMonthly.discountedRawPrice,
						full: withoutProRatedCredits
							? totalPricesFull.discountedRawPrice
							: totalPricesFull.planDiscountedRawPrice || totalPricesFull.discountedRawPrice,
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
