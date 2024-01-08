import {
	PLAN_MONTHLY_PERIOD,
	type PlanSlug,
	getTermFromDuration,
	calculateMonthlyPrice,
} from '@automattic/calypso-products';
import { Plans, WpcomPlansUI, Purchases } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useSelector } from 'react-redux';
import { getPlanPrices } from 'calypso/state/plans/selectors';
import { PlanPrices } from 'calypso/state/plans/types';
import { getSitePlanRawPrice } from 'calypso/state/sites/plans/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import useCheckPlanAvailabilityForPurchase from '../use-check-plan-availability-for-purchase';
import type { AddOnMeta } from '@automattic/data-stores';
import type {
	UsePricingMetaForGridPlans,
	PricingMetaForGridPlan,
} from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';
import type { IAppState } from 'calypso/state/types';

interface Props {
	planSlugs: PlanSlug[];
	withoutProRatedCredits?: boolean;
	storageAddOns?: ( AddOnMeta | null )[] | null;
	coupon?: string;
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

/*
 * Returns the pricing metadata needed for the plans-ui components.
 * - see PricingMetaForGridPlan type for details
 * - will migrate to data-store once dependencies are resolved (when site & plans data-stores more complete)
 */

const usePricingMetaForGridPlans: UsePricingMetaForGridPlans = ( {
	planSlugs,
	withoutProRatedCredits = false,
	storageAddOns,
	coupon,
}: Props ) => {
	// TODO: pass this in as a prop to uncouple the dependency
	const selectedSiteId = useSelector( getSelectedSiteId ) ?? undefined;
	// TODO: pass this in as a prop to uncouple the dependency
	const planAvailabilityForPurchase = useCheckPlanAvailabilityForPurchase( { planSlugs } );

	// pricedAPIPlans - should have a definition for all plans, being the main source of API data
	const pricedAPIPlans = Plans.usePlans( { coupon } );
	// pricedAPISitePlans - unclear if all plans are included
	const pricedAPISitePlans = Plans.useSitePlans( { siteId: selectedSiteId } );
	const currentPlan = Plans.useCurrentPlan( { siteId: selectedSiteId } );
	const introOffers = Plans.useIntroOffers( { siteId: selectedSiteId } );
	const purchasedPlan = Purchases.useSitePurchaseById( {
		siteId: selectedSiteId,
		purchaseId: currentPlan?.purchaseId,
	} );

	const selectedStorageOptions = useSelect( ( select ) => {
		return select( WpcomPlansUI.store ).getSelectedStorageOptions();
	}, [] );

	const planPrices = useSelector( ( state: IAppState ) => {
		return planSlugs.reduce(
			( acc, planSlug ) => {
				const availableForPurchase = planAvailabilityForPurchase[ planSlug ];
				const selectedStorageOption = selectedStorageOptions?.[ planSlug ];
				const selectedStorageAddOn = storageAddOns?.find( ( addOn ) => {
					return selectedStorageOption && addOn?.featureSlugs?.includes( selectedStorageOption );
				} );
				const storageAddOnPrices =
					selectedStorageAddOn?.purchased || selectedStorageAddOn?.exceedsSiteStorageLimits
						? null
						: selectedStorageAddOn?.prices;
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

				/**
				 * 1. Original prices only for current site's plan.
				 */
				if ( selectedSiteId && currentPlan?.planSlug === planSlug ) {
					let monthlyPrice = getSitePlanRawPrice( state, selectedSiteId, planSlug, {
						returnMonthly: true,
						returnSmallestUnit: true,
					} );
					let fullPrice = getSitePlanRawPrice( state, selectedSiteId, planSlug, {
						returnMonthly: false,
						returnSmallestUnit: true,
					} );

					/**
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

				/**
				 * 2. Original and Discounted prices for plan available for purchase.
				 */
				if ( availableForPurchase ) {
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
				}

				/**
				 * 3. Original prices only for plan not available for purchase.
				 */
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
			},
			{} as {
				[ planSlug: string ]: Pick< PricingMetaForGridPlan, 'originalPrice' | 'discountedPrice' >;
			}
		);
	} );

	/*
	 * Return null until all data is ready, at least in initial state.
	 * - For now a simple loader is shown until these are resolved
	 * - We can optimise Error states in the UI / when everything gets ported into data-stores
	 * - `pricedAPISitePlans` being a dependent query will only get fetching status when enabled (when `siteId` exists)
	 */

	if ( ( selectedSiteId && pricedAPISitePlans.isLoading ) || pricedAPIPlans.isLoading ) {
		return null;
	}

	return planSlugs.reduce(
		( acc, planSlug ) => ( {
			...acc,
			[ planSlug ]: {
				originalPrice: planPrices[ planSlug ]?.originalPrice,
				discountedPrice: planPrices[ planSlug ]?.discountedPrice,
				billingPeriod: pricedAPIPlans.data?.[ planSlug ]?.billPeriod,
				currencyCode: pricedAPIPlans.data?.[ planSlug ]?.currencyCode,
				expiry: pricedAPISitePlans.data?.[ planSlug ]?.expiry,
				introOffer: introOffers?.[ planSlug ],
			},
		} ),
		{} as { [ planSlug: string ]: PricingMetaForGridPlan }
	);
};

export default usePricingMetaForGridPlans;
