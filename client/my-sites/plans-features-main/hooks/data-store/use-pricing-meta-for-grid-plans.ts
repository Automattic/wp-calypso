import {
	PLAN_MONTHLY_PERIOD,
	type PlanSlug,
	getTermFromDuration,
	calculateMonthlyPrice,
} from '@automattic/calypso-products';
import { Plans, WpcomPlansUI, Purchases } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useSelector } from 'react-redux';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import useCheckPlanAvailabilityForPurchase from '../use-check-plan-availability-for-purchase';
import type { AddOnMeta } from '@automattic/data-stores';
import type {
	UsePricingMetaForGridPlans,
	PricingMetaForGridPlan,
} from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';

interface Props {
	planSlugs: PlanSlug[];
	withoutProRatedCredits?: boolean;
	storageAddOns?: ( AddOnMeta | null )[] | null;
	coupon?: string;
}

function getTotalPrice( planPrice: number | null | undefined, addOnPrice = 0 ): number | null {
	return null !== planPrice && undefined !== planPrice ? planPrice + addOnPrice : null;
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

	// plans - should have a definition for all plans, being the main source of API data
	const plans = Plans.usePlans( { coupon } );
	// sitePlans - unclear if all plans are included
	const sitePlans = Plans.useSitePlans( { siteId: selectedSiteId } );
	const currentPlan = Plans.useCurrentPlan( { siteId: selectedSiteId } );
	const introOffers = Plans.useIntroOffers( { siteId: selectedSiteId, coupon } );
	const purchasedPlan = Purchases.useSitePurchaseById( {
		siteId: selectedSiteId,
		purchaseId: currentPlan?.purchaseId,
	} );

	const selectedStorageOptions = useSelect(
		( select ) => select( WpcomPlansUI.store ).getSelectedStorageOptions(),
		[]
	);

	let planPrices:
		| {
				[ planSlug in PlanSlug ]?: {
					originalPrice: Plans.PlanPricing[ 'originalPrice' ];
					discountedPrice: Plans.PlanPricing[ 'discountedPrice' ];
				};
		  }
		| null = null;

	if ( ( selectedSiteId && sitePlans.isLoading ) || plans.isLoading ) {
		/**
		 * Null until all data is ready, at least in initial state.
		 * - For now a simple loader is shown until these are resolved
		 * - `sitePlans` being a dependent query will only get fetching status when enabled (when `siteId` exists)
		 */
		planPrices = null;
	} else {
		/**
		 * Projected prices as needed for the plan-grid UI.
		 */
		planPrices = Object.fromEntries(
			planSlugs.map( ( planSlug ) => {
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

				const plan = plans.data?.[ planSlug ];
				const sitePlan = sitePlans.data?.[ planSlug ];

				/**
				 * 0. No plan or sitePlan (when selected site exists): planSlug is for a priceless plan.
				 * TODO clk: the condition on `.pricing` here needs investigation. There should be a pricing object for all returned API plans.
				 */
				if ( ! plan?.pricing || ( selectedSiteId && ! sitePlan?.pricing ) ) {
					return [
						planSlug,
						{
							originalPrice: {
								monthly: null,
								full: null,
							},
							discountedPrice: {
								monthly: null,
								full: null,
							},
						},
					];
				}

				/**
				 * 1. Original prices only for current site's plan.
				 */
				if ( selectedSiteId && currentPlan?.planSlug === planSlug ) {
					let monthlyPrice = sitePlan?.pricing.originalPrice.monthly;
					let fullPrice = sitePlan?.pricing.originalPrice.full;

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

					return [
						planSlug,
						{
							originalPrice: {
								monthly: getTotalPrice( monthlyPrice ?? null, storageAddOnPriceMonthly ),
								full: getTotalPrice( fullPrice ?? null, storageAddOnPriceYearly ),
							},
							discountedPrice: {
								monthly: null,
								full: null,
							},
						},
					];
				}

				/**
				 * 2. Original and Discounted prices for plan available for purchase.
				 * - If prorated credits are needed, then pick the discounted price from sitePlan (site context) if one exists.
				 */
				if ( availableForPurchase ) {
					const originalPrice = {
						monthly: getTotalPrice( plan.pricing.originalPrice.monthly, storageAddOnPriceMonthly ),
						full: getTotalPrice( plan.pricing.originalPrice.full, storageAddOnPriceYearly ),
					};
					const discountedPrice = {
						monthly:
							sitePlan?.pricing && ! withoutProRatedCredits
								? getTotalPrice(
										sitePlan.pricing.discountedPrice.monthly,
										storageAddOnPriceMonthly
								  )
								: getTotalPrice( plan.pricing.discountedPrice.monthly, storageAddOnPriceMonthly ),
						full:
							sitePlan?.pricing && ! withoutProRatedCredits
								? getTotalPrice( sitePlan.pricing.discountedPrice.full, storageAddOnPriceYearly )
								: getTotalPrice( plan.pricing.discountedPrice.full, storageAddOnPriceYearly ),
					};

					return [
						planSlug,
						{
							originalPrice,
							discountedPrice,
						},
					];
				}

				/**
				 * 3. Original prices only for plan not available for purchase.
				 */
				return [
					planSlug,
					{
						originalPrice: {
							monthly: getTotalPrice(
								plan.pricing.originalPrice.monthly,
								storageAddOnPriceMonthly
							),
							full: getTotalPrice( plan.pricing.originalPrice.full, storageAddOnPriceYearly ),
						},
						discountedPrice: {
							monthly: null,
							full: null,
						},
					},
				];
			} )
		);
	}

	return (
		// TODO: consider removing the null return
		planPrices &&
		planSlugs.reduce(
			( acc, planSlug ) => ( {
				...acc,
				[ planSlug ]: {
					originalPrice: planPrices?.[ planSlug ]?.originalPrice,
					discountedPrice: planPrices?.[ planSlug ]?.discountedPrice,
					// TODO clk: the condition on `.pricing` here needs investigation. There should be a pricing object for all returned API plans.
					billingPeriod: plans.data?.[ planSlug ]?.pricing?.billPeriod,
					// TODO clk: the condition on `.pricing` here needs investigation. There should be a pricing object for all returned API plans.
					currencyCode: plans.data?.[ planSlug ]?.pricing?.currencyCode,
					expiry: sitePlans.data?.[ planSlug ]?.expiry,
					introOffer: introOffers?.[ planSlug ],
				},
			} ),
			{} as { [ planSlug in PlanSlug ]?: PricingMetaForGridPlan }
		)
	);
};

export default usePricingMetaForGridPlans;
