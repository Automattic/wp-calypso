import { PRODUCT_JETPACK_STATS_YEARLY } from '@automattic/calypso-products';
import { ProductsList } from '@automattic/data-stores';
import formatCurrency from '@automattic/format-currency';
import {
	default as usePlanUsageQuery,
	PlanUsage,
} from 'calypso/my-sites/stats/hooks/use-plan-usage-query';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { PriceTierListItemProps, StatsPlanTierUI } from './types';

// Special case for per-unit fees over the max tier.
export const EXTENSION_THRESHOLD_IN_MILLION = 2;
const EXTENDED_TIER_COUNT = 5;

// TODO: Remove the mock data after release.
// No need to translate mock data.
const MOCK_PLAN_DATA = [
	{
		minimum_price: 10000,
		price: '$9',
		views: 10000,
		description: '$9/month for 10k views',
	},
	{
		minimum_price: 20000,
		price: '$19',
		views: 100000,
		description: '$19/month for 100k views',
	},
	{
		minimum_price: 30000,
		price: '$29',
		views: 250000,
		description: '$29/month for 250k views',
	},
	{
		minimum_price: 50000,
		price: '$49',
		views: 500000,
		description: '$49/month for 500k views',
	},
	{
		minimum_price: 70000,
		price: '$69',
		views: 1000000,
		description: '$69/month for 1M views',
	},
	{
		minimum_price: 95000,
		price: '$89.99',
		views: null,
		extension: true,
		per_unit_fee: 1799,
		description: '$25/month per million views if views exceed 1M',
	},
];

function transformTier( tier: PriceTierListItemProps ): StatsPlanTierUI {
	// TODO: Some description of transform logic here.
	// So as to clarify what we should expect from the API.
	if ( tier?.maximum_units === null ) {
		// highest tier extension
		return {
			minimum_price: tier?.minimum_price,
			price: tier?.minimum_price_monthly_display,
			views: EXTENSION_THRESHOLD_IN_MILLION * ( tier?.transform_quantity_divide_by ?? 0 ),
			extension: true,
			transform_quantity_divide_by: tier?.transform_quantity_divide_by,
			per_unit_fee: tier?.per_unit_fee,
		};
	}

	return {
		minimum_price: tier?.minimum_price,
		price: tier?.maximum_price_monthly_display,
		views: tier?.maximum_units,
	};
}

function filterPurchasedTiers(
	availableTiers: StatsPlanTierUI[],
	usageData: PlanUsage | undefined
): StatsPlanTierUI[] {
	// Filter out already purchased tiers.
	let tiers: StatsPlanTierUI[];

	if ( ! usageData || usageData?.views_limit === null || usageData?.views_limit === 0 ) {
		// No tier has been purchased.
		tiers = availableTiers;
	} else {
		tiers = availableTiers.filter( ( availableTier ) => {
			return (
				!! availableTier.transform_quantity_divide_by ||
				( availableTier?.views as number ) > usageData?.views_limit
			);
		} );
	}

	return tiers;
}

function extendTiersBeyondHighestTier(
	availableTiers: StatsPlanTierUI[],
	currencyCode: string
): StatsPlanTierUI[] {
	if ( availableTiers.length === 1 && !! availableTiers[ 0 ].transform_quantity_divide_by ) {
		const highestTier = availableTiers[ 0 ];

		for (
			let extendedTierCount = 1;
			extendedTierCount <= EXTENDED_TIER_COUNT;
			extendedTierCount++
		) {
			const totalPrice =
				highestTier?.minimum_price + ( highestTier.per_unit_fee ?? 0 ) * extendedTierCount;
			const monthlyPriceDisplay = formatCurrency( totalPrice / 12, currencyCode, {
				isSmallestUnit: true,
				stripZeros: true,
			} );
			const views =
				( highestTier?.views ?? 0 ) +
				( highestTier.transform_quantity_divide_by ?? 0 ) * extendedTierCount;

			availableTiers.push( {
				minimum_price: totalPrice,
				price: monthlyPriceDisplay,
				views: views,
				extension: true,
				transform_quantity_divide_by: highestTier?.transform_quantity_divide_by,
				// The price is yearly for yearly plans, so we need to divide by 12.
				per_unit_fee: highestTier?.per_unit_fee,
			} );
		}
	}

	return availableTiers;
}

function useAvailableUpgradeTiers(
	siteId: number | null,
	shouldFilterPurchasedTiers = true
): StatsPlanTierUI[] {
	// 1. Get the tiers. Default to yearly pricing.
	const commercialProduct = useSelector( ( state ) =>
		getProductBySlug( state, PRODUCT_JETPACK_STATS_YEARLY )
	) as ProductsList.ProductsListItem | null;
	const { data: usageData } = usePlanUsageQuery( siteId );

	if ( ! commercialProduct ) {
		return MOCK_PLAN_DATA;
	}

	let tiersForUi = commercialProduct.price_tier_list.map( transformTier );
	const currencyCode = commercialProduct.currency_code || 'USD';

	tiersForUi = tiersForUi.length > 0 ? tiersForUi : MOCK_PLAN_DATA;

	// 2. Filter based on current plan.
	if ( shouldFilterPurchasedTiers ) {
		tiersForUi = filterPurchasedTiers( tiersForUi, usageData );
	}

	tiersForUi = extendTiersBeyondHighestTier( tiersForUi, currencyCode );

	// 3. Return the relevant upgrade options as a list.
	return tiersForUi;
}

export default useAvailableUpgradeTiers;
