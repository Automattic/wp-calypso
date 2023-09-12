import { Plans } from '@automattic/data-stores';
import { useSelector } from 'react-redux';
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
	currencyCode?: string | null;
	shouldUseSmallestUnitCurrency?: boolean;
}

/*
 * Returns the pricing metadata needed for the plans-ui components.
 * - see PricingMetaForGridPlan type for details
 * - will migrate to data-store once dependencies are resolved (when site & plans data-stores more complete)
 */
const usePricingMetaForGridPlans: UsePricingMetaForGridPlans = ( {
	planSlugs,
	withoutProRatedCredits = false,
	shouldUseSmallestUnitCurrency,
}: Props ) => {
	const selectedSiteId = useSelector( getSelectedSiteId ) ?? undefined;
	const currentSitePlanSlug = useSelector( ( state: IAppState ) =>
		getSitePlanSlug( state, selectedSiteId )
	);
	const pricedAPIPlans = usePricedAPIPlans( { planSlugs: planSlugs } );
	const sitePlans = Plans.useSitePlans( { siteId: selectedSiteId } );
	const returnSmallestUnit = shouldUseSmallestUnitCurrency;

	const planPrices = useSelector( ( state: IAppState ) => {
		return planSlugs.reduce( ( acc, planSlug ) => {
			const availableForPurchase =
				! currentSitePlanSlug ||
				( selectedSiteId ? isPlanAvailableForPurchase( state, selectedSiteId, planSlug ) : false );

			const planPricesMonthly = getPlanPrices( state, {
				planSlug,
				siteId: selectedSiteId || null,
				returnMonthly: true,
				returnSmallestUnit,
			} );
			const planPricesFull = getPlanPrices( state, {
				planSlug,
				siteId: selectedSiteId || null,
				returnMonthly: false,
				returnSmallestUnit,
			} );

			// raw prices for current site's plan
			if ( selectedSiteId && currentSitePlanSlug === planSlug ) {
				return {
					...acc,
					[ planSlug ]: {
						originalPrice: {
							monthly: getSitePlanRawPrice( state, selectedSiteId, planSlug, {
								returnMonthly: true,
								returnSmallestUnit,
							} ),
							full: getSitePlanRawPrice( state, selectedSiteId, planSlug, {
								returnMonthly: false,
								returnSmallestUnit,
							} ),
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
						monthly: planPricesMonthly.rawPrice,
						full: planPricesFull.rawPrice,
					},
					discountedPrice: {
						monthly: withoutProRatedCredits
							? planPricesMonthly.discountedRawPrice
							: planPricesMonthly.planDiscountedRawPrice || planPricesMonthly.discountedRawPrice,
						full: withoutProRatedCredits
							? planPricesFull.discountedRawPrice
							: planPricesFull.planDiscountedRawPrice || planPricesFull.discountedRawPrice,
					},
				},
			};
		}, {} as { [ planSlug: string ]: Pick< PricingMetaForGridPlan, 'originalPrice' | 'discountedPrice' > } );
	} );

	/*
	 * Return null until all data is ready, at least in initial state.
	 * - For now a simple loader is shown until these are resolved
	 * - We can optimise Error states in the UI / when everything gets ported into data-stores
	 */
	if ( sitePlans.isFetching || ! pricedAPIPlans ) {
		return null;
	}

	return planSlugs.reduce( ( acc, planSlug ) => {
		// pricedAPIPlans - should have a definition for all plans, being the main source of API data
		const pricedAPIPlan = pricedAPIPlans[ planSlug ];
		// pricedAPISitePlans - unclear if all plans are included
		const sitePlan = sitePlans.data?.[ planSlug ];

		return {
			...acc,
			[ planSlug ]: {
				originalPrice: planPrices[ planSlug ]?.originalPrice,
				discountedPrice: planPrices[ planSlug ]?.discountedPrice,
				billingPeriod: pricedAPIPlan?.bill_period,
				currencyCode: pricedAPIPlan?.currency_code,
				introOffer: sitePlan?.introOffer,
				shouldUseSmallestUnitCurrency,
			},
		};
	}, {} as { [ planSlug: string ]: PricingMetaForGridPlan } );
};

export default usePricingMetaForGridPlans;
