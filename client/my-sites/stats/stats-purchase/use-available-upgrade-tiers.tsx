import { PRODUCT_JETPACK_STATS_YEARLY } from '@automattic/calypso-products';
import { ProductsList } from '@automattic/data-stores';
import {
	default as usePlanUsageQuery,
	PlanUsage,
} from 'calypso/my-sites/stats/hooks/use-plan-usage-query';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { PriceTierListItemProps, StatsPlanTierUI } from './types';

// TODO: Remove the mock data after release.
// No need to translate mock data.
const MOCK_PLAN_DATA = [
	{
		price: '$9',
		views: 10000,
		description: '$9/month for 10k views',
	},
	{
		price: '$19',
		views: 100000,
		description: '$19/month for 100k views',
	},
	{
		price: '$29',
		views: 250000,
		description: '$29/month for 250k views',
	},
	{
		price: '$49',
		views: 500000,
		description: '$49/month for 500k views',
	},
	{
		price: '$69',
		views: 1000000,
		description: '$69/month for 1M views',
	},
	{
		price: '$89.99',
		views: '1M++',
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
			price: tier?.minimum_price_monthly_display,
			views: tier?.maximum_units,
			extension: true,
			// The price is yearly for yearly plans, so we need to divide by 12.
			per_unit_fee: ( tier?.per_unit_fee ?? 0 ) / 12,
		};
	}

	return {
		price: tier?.maximum_price_monthly_display,
		views: tier?.maximum_units,
	};
}

function filterPurchasedTiers(
	availableTiers: StatsPlanTierUI[],
	purchasedTiers: PlanUsage | undefined
): StatsPlanTierUI[] {
	// Filter out already purchased tiers.
	let tiers: StatsPlanTierUI[];

	if (
		! purchasedTiers ||
		purchasedTiers?.views_limit === null ||
		purchasedTiers?.views_limit === 0
	) {
		// No tier has been purchased.
		tiers = availableTiers;
	} else {
		tiers = availableTiers.filter( ( availableTier ) => {
			if ( ! availableTier?.views || ! purchasedTiers?.views_limit ) {
				return true;
			}

			return (
				availableTier.views === null ||
				( availableTier?.views as number ) > purchasedTiers?.views_limit
			);
		} );
	}

	return tiers;
}

function useAvailableUpgradeTiers(
	siteId: number | null,
	shouldFilterPurchasedTiers = true
): StatsPlanTierUI[] {
	// 1. Get the tiers. Default to yearly pricing.
	const commercialProduct = useSelector( ( state ) =>
		getProductBySlug( state, PRODUCT_JETPACK_STATS_YEARLY )
	) as ProductsList.ProductsListItem | null;
	const { data: purchasedTiers } = usePlanUsageQuery( siteId );

	let tiersForUi = commercialProduct?.price_tier_list?.map( transformTier );

	tiersForUi = tiersForUi?.length > 0 ? tiersForUi : MOCK_PLAN_DATA;

	// 2. Filter based on current plan.
	if ( shouldFilterPurchasedTiers ) {
		tiersForUi = filterPurchasedTiers( tiersForUi, purchasedTiers );
	}

	// 3. Return the relevant upgrade options as a list.
	return tiersForUi;
}

export default useAvailableUpgradeTiers;
