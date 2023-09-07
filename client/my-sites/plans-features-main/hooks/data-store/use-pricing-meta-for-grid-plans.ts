import { Plans, WpcomPlansUI } from '@automattic/data-stores';
import { getCurrencyObject } from '@automattic/format-currency';
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
import type { AddOnMeta } from '@automattic/data-stores';
import type {
	UsePricingMetaForGridPlans,
	PricingMetaForGridPlan,
} from 'calypso/my-sites/plan-features-2023-grid/hooks/npm-ready/data-store/use-grid-plans';
import type { IAppState } from 'calypso/state/types';

interface Props {
	planSlugs: PlanSlug[];
	withoutProRatedCredits?: boolean;
	storageAddOns?: ( AddOnMeta | null )[] | null;
	currencyCode?: string | null;
}

/***
 * The 2023 Pricing Grid handles prices differently than add-ons, so for the time being we need to
 * do some conversion to calculate totals correctly.
 *
 * The 2023 pricing grid currently handles prices in some currencies in their smallest unit, like
 * the Japanese Yen. For others, however, like USD, prices are not handled in their smallest unit,
 * like the US dollar.
 *
 * For example, 2000 yen would be represented by the integer 2000 since a yen is the smallest unit.
 * $20.00, however, would be represented as the integer 20, and not 2000. Since storage add-on
 * prices are always handled in the smallest unit, we need to convert them, when appropriate, to the
 * correct integer.
 *
 * We should expose a more friendly function from the format-currency package
 */
function convertPriceForSmallestUnit( price: number, currencyCode: string | null ) {
	const currencyObject = getCurrencyObject( price, currencyCode || '', {
		isSmallestUnit: true,
	} );
	return parseInt( currencyObject.integer.replace( /,/g, '' ) );
}

function getTotalPrices( planPrices: PlanPrices, addOnPrice = 0 ): PlanPrices {
	const totalPrices = { ...planPrices };
	let key: keyof PlanPrices;

	for ( key in totalPrices ) {
		const price = totalPrices[ key ];

		if ( ! ( price === null ) ) {
			// Display prices are rounded to the nearest dollar,
			// so we do the same for the add-on price
			totalPrices[ key ] = price + Math.round( addOnPrice );
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
	currencyCode = '',
}: Props ) => {
	const selectedSiteId = useSelector( getSelectedSiteId ) ?? undefined;
	const currentSitePlanSlug = useSelector( ( state: IAppState ) =>
		getSitePlanSlug( state, selectedSiteId )
	);
	const pricedAPIPlans = usePricedAPIPlans( { planSlugs: planSlugs } );
	const sitePlans = Plans.useSitePlans( { siteId: selectedSiteId } );
	const selectedStorageOptions = useSelect( ( select ) => {
		return select( WpcomPlansUI.store ).getSelectedStorageOptions();
	}, [] );
	const planPrices = useSelector( ( state: IAppState ) => {
		return planSlugs.reduce( ( acc, planSlug ) => {
			const availableForPurchase =
				! currentSitePlanSlug ||
				( selectedSiteId ? isPlanAvailableForPurchase( state, selectedSiteId, planSlug ) : false );
			const selectedStorageOption = selectedStorageOptions?.[ planSlug ];
			const storageAddOnPrices = storageAddOns?.find( ( addOn ) => {
				return addOn?.featureSlugs?.includes( selectedStorageOption || '' );
			} )?.prices;
			const storageAddOnPriceMonthly = convertPriceForSmallestUnit(
				storageAddOnPrices?.monthlyPrice || 0,
				currencyCode
			);
			const storageAddOnPriceYearly = convertPriceForSmallestUnit(
				storageAddOnPrices?.yearlyPrice || 0,
				currencyCode
			);

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

			// raw prices for current site's plan
			if ( selectedSiteId && currentSitePlanSlug === planSlug ) {
				const monthlyPrice = getSitePlanRawPrice( state, selectedSiteId, planSlug, {
					returnMonthly: true,
					returnSmallestUnit: true,
				} );
				const yearlyPrice = getSitePlanRawPrice( state, selectedSiteId, planSlug, {
					returnMonthly: false,
					returnSmallestUnit: true,
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
			},
		};
	}, {} as { [ planSlug: string ]: PricingMetaForGridPlan } );
};

export default usePricingMetaForGridPlans;
