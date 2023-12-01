import { PRODUCT_JETPACK_STATS_YEARLY } from '@automattic/calypso-products';
import { ProductsList } from '@automattic/data-stores';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { PriceTierListItemProps, StatsPlanTierUI } from './types';

// TODO: remove the mock data after release.
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
	if ( tier?.maximum_units === null ) {
		// highest tier extension
		return {
			price: tier?.minimum_price_monthly_display,
			views: tier?.maximum_units,
			extension: true,
			per_unit_fee: tier?.per_unit_fee,
		};
	}

	return {
		price: tier?.maximum_price_monthly_display,
		views: tier?.maximum_units,
	};
}

function getPlanTiersForSite( siteId: number | null, tiers: StatsPlanTierUI[] ): StatsPlanTierUI[] {
	// TODO: Determine if we need to filter tiers locally.
	// Accept the fill list of tiers and filter out options
	// that don't apply to the current site (ie: only upgrades, not downgrades)
	// Could happen on the server, in which case, we could remove this step.
	return tiers;
}

function useAvailableUpgradeTiers( siteId: number | null ): StatsPlanTierUI[] {
	// 1. Get the tiers.
	const commercialProduct = useSelector( ( state ) =>
		getProductBySlug( state, PRODUCT_JETPACK_STATS_YEARLY )
	) as ProductsList.ProductsListItem | null;

	let tiersForUi = commercialProduct?.price_tier_list?.map( transformTier );

	tiersForUi = tiersForUi?.length > 0 ? tiersForUi : MOCK_PLAN_DATA;

	// 2. Filter based on current plan. (this could also happen on the server)
	tiersForUi = getPlanTiersForSite( siteId, tiersForUi );

	// 3. Return the relevant upgrade options as a list.
	return tiersForUi;
}

export default useAvailableUpgradeTiers;
