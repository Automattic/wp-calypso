import {
	PLAN_MONTHLY_PERIOD,
	type PlanSlug,
	getTermFromDuration,
	calculateMonthlyPrice,
} from '@automattic/calypso-products';
import { Plans, WpcomPlansUI } from '@automattic/data-stores';
import { createSelector } from '@automattic/state-utils';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { useSelector } from 'react-redux';
import usePricedAPIPlans from 'calypso/my-sites/plans-features-main/hooks/data-store/use-priced-api-plans';
import { getPlanPrices } from 'calypso/state/plans/selectors';
import { PlanPrices } from 'calypso/state/plans/types';
import { getByPurchaseId, getPurchases } from 'calypso/state/purchases/selectors';
import {
	getCurrentPlan,
	getPlansBySiteId,
	getSitePlan,
	getSitePlanRawPrice,
	isPlanAvailableForPurchase,
} from 'calypso/state/sites/plans/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { AppState } from 'calypso/types';
import type { AddOnMeta, SelectedStorageOptionForPlans } from '@automattic/data-stores';
import type {
	UsePricingMetaForGridPlans,
	PricingMetaForGridPlan,
} from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';
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

		if ( price !== null ) {
			totalPrices[ key ] = price + addOnPrice;
		}
	}

	return totalPrices;
}

const getRawPrices = createSelector(
	(
		state: AppState,
		planSlugs: PlanSlug[],
		selectedStorageOptions: SelectedStorageOptionForPlans | undefined,
		storageAddOns: ( AddOnMeta | null )[] | null | undefined,
		withoutProRatedCredits: boolean | undefined
	) => {
		const selectedSiteId = getSelectedSiteId( state );
		const currentPlan = getCurrentPlan( state, selectedSiteId );
		const currentSitePlanSlug = currentPlan?.productSlug;
		const purchasedPlan = getByPurchaseId( state, currentPlan?.id || 0 );

		return planSlugs.reduce(
			( acc, planSlug ) => {
				const availableForPurchase =
					! currentSitePlanSlug ||
					( selectedSiteId
						? isPlanAvailableForPurchase( state, selectedSiteId, planSlug )
						: false );
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
					returnSmallestUnit: true,
				} );
				const planPricesFull = getPlanPrices( state, {
					planSlug,
					siteId: selectedSiteId || null,
					returnMonthly: false,
					returnSmallestUnit: true,
				} );
				const totalPricesMonthly = getTotalPrices( planPricesMonthly, storageAddOnPriceMonthly );
				const totalPricesFull = getTotalPrices( planPricesFull, storageAddOnPriceYearly );

				/*
				 * Raw prices for current site's plan
				 */
				if ( selectedSiteId && currentSitePlanSlug === planSlug ) {
					let monthlyPrice = getSitePlanRawPrice( state, selectedSiteId, planSlug, {
						returnMonthly: true,
						returnSmallestUnit: true,
					} );
					let fullPrice = getSitePlanRawPrice( state, selectedSiteId, planSlug, {
						returnMonthly: false,
						returnSmallestUnit: true,
					} );

					/*
					 * Ensure the spotlight plan shows the price with which the plans was purchased.
					 */
					if ( purchasedPlan ) {
						const isMonthly = purchasedPlan.billPeriodDays === PLAN_MONTHLY_PERIOD;

						if ( isMonthly && monthlyPrice !== purchasedPlan.priceInteger ) {
							monthlyPrice = purchasedPlan.priceInteger;
							fullPrice = parseFloat( ( purchasedPlan.priceInteger * 12 ).toFixed( 2 ) );
						} else if ( fullPrice !== purchasedPlan.priceInteger ) {
							const term = getTermFromDuration( purchasedPlan.billPeriodDays ) || '';
							monthlyPrice = calculateMonthlyPrice( term, purchasedPlan.priceInteger );
							fullPrice = purchasedPlan.priceInteger;
						}
					}

					return {
						...acc,
						[ planSlug ]: {
							originalPrice: {
								monthly: monthlyPrice ? monthlyPrice + storageAddOnPriceMonthly : null,
								full: fullPrice ? fullPrice + storageAddOnPriceYearly : null,
							},
							discountedPrice: {
								monthly: null,
								full: null,
							},
						},
					};
				}

				/*
				 * Raw prices for plan not available for purchase
				 */
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

				/*
				 * Raw prices with discounts for plan available for purchase
				 */
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
								: totalPricesMonthly.planDiscountedRawPrice ||
								  totalPricesMonthly.discountedRawPrice,
							full: withoutProRatedCredits
								? totalPricesFull.discountedRawPrice
								: totalPricesFull.planDiscountedRawPrice || totalPricesFull.discountedRawPrice,
						},
					},
				};
			},
			{} as {
				[ planSlug: string ]: Pick< PricingMetaForGridPlan, 'originalPrice' | 'discountedPrice' >;
			}
		);
	},
	(
		state: AppState,
		planSlugs: PlanSlug[],
		selectedStorageOptions: SelectedStorageOptionForPlans | undefined,
		storageAddOns: ( AddOnMeta | null )[] | null | undefined,
		withoutProRatedCredits: boolean | undefined
	) => [
		getSelectedSiteId( state ),
		getCurrentPlan( state, getSelectedSiteId( state ) ),
		getSitePlan( state, getSelectedSiteId( state ) ),
		getPlansBySiteId( state, getSelectedSiteId( state ) ?? undefined ), // consumed by getPlanPrices
		state.plans?.items, // consumed by getPlanPrices
		getPurchases( state ),
		// planSlugs,
		// selectedStorageOptions,
		// storageAddOns,
		// withoutProRatedCredits,
	]
);

/**
 * Returns the pricing metadata needed for the plans-ui components.
 * - see PricingMetaForGridPlan type for details
 * - will migrate to data-store once dependencies are resolved (when site & plans data-stores more complete)
 */
let foo;
let bar = [];
const usePricingMetaForGridPlans: UsePricingMetaForGridPlans = ( {
	planSlugs,
	withoutProRatedCredits = false,
	storageAddOns,
}: Props ) => {
	const selectedSiteId = useSelector( getSelectedSiteId ) ?? undefined;
	const pricedAPIPlans = usePricedAPIPlans( { planSlugs } );
	const sitePlans = Plans.useSitePlans( { siteId: selectedSiteId } );
	const selectedStorageOptions = useSelect( ( select ) => {
		return select( WpcomPlansUI.store ).getSelectedStorageOptions();
	}, [] );

	// const planPrices = useRawPrices( planSlugs, storageAddOns, withoutProRatedCredits );

	const planPrices = useSelector( ( state: IAppState ) =>
		getRawPrices( state, planSlugs, selectedStorageOptions, storageAddOns, withoutProRatedCredits )
	);

	if ( planSlugs.length > 1 ) {
		console.log(
			foo === planPrices,
			planSlugs
			// bar[ 0 ] === planSlugs // ok
			// selectedStorageOptions
			// bar[ 1 ] === selectedStorageOptions // ok
			// storageAddOns
			// bar[ 2 ] === selectedStorageOptions // ok
		);

		foo = planPrices;
		bar = [ planSlugs, selectedStorageOptions, storageAddOns, withoutProRatedCredits ];
	}

	const pricingMeta = useMemo( () => {
		/*
		 * Return null until all data is ready, at least in initial state.
		 * - For now a simple loader is shown until these are resolved
		 * - We can optimise Error states in the UI / when everything gets ported into data-stores
		 */
		if ( sitePlans.isFetching || ! pricedAPIPlans ) {
			return null;
		}

		return planSlugs.reduce(
			( acc, planSlug ) => {
				// pricedAPIPlans - should have a definition for all plans, being the main source of API data
				const pricedAPIPlan = pricedAPIPlans?.[ planSlug ];
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
						expiry: sitePlan?.expiry,
					},
				};
			},
			{} as { [ planSlug: string ]: PricingMetaForGridPlan }
		);
	}, [ planSlugs, pricedAPIPlans, sitePlans, planPrices ] );

	return pricingMeta;
};

export default usePricingMetaForGridPlans;
