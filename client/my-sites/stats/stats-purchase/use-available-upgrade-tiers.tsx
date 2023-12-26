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
const EXTENDED_TIERS_AMOUNT = 5;

// TODO: Remove the mock data after release.
// No need to translate mock data.
const MOCK_PLAN_DATA = [
	{
		minimum_price: 10000,
		price: '$8.34',
		views: 10000,
		description: '$9/month for 10k views',
	},
	{
		minimum_price: 20000,
		price: '$16.67',
		views: 100000,
		description: '$19/month for 100k views',
	},
	{
		minimum_price: 30000,
		price: '$25',
		views: 250000,
		description: '$29/month for 250k views',
	},
	{
		minimum_price: 50000,
		price: '$41.67',
		views: 500000,
		description: '$49/month for 500k views',
	},
	{
		minimum_price: 70000,
		price: '$58.34',
		views: 1000000,
		description: '$69/month for 1M views',
	},
	{
		minimum_price: 95000,
		price: '$79.17',
		views: null,
		extension: true,
		per_unit_fee: 25000,
		description: '$25/month per million views if views exceed 1M',
	},
];

function transformTier( tier: PriceTierListItemProps ): StatsPlanTierUI {
	// TODO: Some description of transform logic here.
	// So as to clarify what we should expect from the API.
	if ( tier?.maximum_units === null ) {
		// Special transformation for highest tier extension.
		return {
			minimum_price: tier?.minimum_price,
			price: tier?.minimum_price_monthly_display,
			views: EXTENSION_THRESHOLD_IN_MILLION * ( tier?.transform_quantity_divide_by || 1 ),
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
	currencyCode: string,
	usageData: PlanUsage
): StatsPlanTierUI[] {
	if ( availableTiers.length === 1 && !! availableTiers[ 0 ].transform_quantity_divide_by ) {
		const highestTier = availableTiers[ 0 ];

		const purchasedExtendedTierCount =
			usageData?.views_limit / ( highestTier.transform_quantity_divide_by || 1 ) -
			EXTENSION_THRESHOLD_IN_MILLION;
		const extendedTierCountStart = purchasedExtendedTierCount + 1;
		const extendedTierCountEnd = extendedTierCountStart + EXTENDED_TIERS_AMOUNT;

		for (
			let extendedTierCount = extendedTierCountStart;
			extendedTierCount <= extendedTierCountEnd;
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
				transform_quantity_divide_by: highestTier.transform_quantity_divide_by,
				per_unit_fee: highestTier?.per_unit_fee,
			} );
		}

		// Remove the first tier, which is used to extend higher tiers.
		availableTiers = availableTiers.slice( 1 );
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

	if ( ! commercialProduct || ! usageData ) {
		return MOCK_PLAN_DATA;
	}

	let tiersForUi = commercialProduct.price_tier_list.map( transformTier );
	const currencyCode = commercialProduct.currency_code || 'USD';

	tiersForUi = tiersForUi.length > 0 ? tiersForUi : MOCK_PLAN_DATA;

	// 2. Filter based on current plan.
	if ( shouldFilterPurchasedTiers ) {
		tiersForUi = filterPurchasedTiers( tiersForUi, usageData );
	}

	tiersForUi = extendTiersBeyondHighestTier( tiersForUi, currencyCode, usageData );

	// 3. Return the relevant upgrade options as a list.
	return tiersForUi;
}

export default useAvailableUpgradeTiers;
