import { PRODUCT_JETPACK_STATS_YEARLY, PriceTierEntry } from '@automattic/calypso-products';
import { formatCurrency } from 'i18n-calypso';
import {
	default as usePlanUsageQuery,
	PlanUsage,
} from 'calypso/my-sites/stats/hooks/use-plan-usage-query';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { IAppState } from 'calypso/state/types';
import { StatsPlanTierUI } from '../stats-purchase/types';

// Special case for per-unit fees over the max tier.
export const EXTENSION_THRESHOLD_IN_MILLION = 2;
export const MAX_TIERS_NUMBER = 6;

/**
 * Filter the tiers that are lower than the current usage / limit
 */
function filterLowerTiers(
	availableTiers: StatsPlanTierUI[],
	usageData: PlanUsage | undefined
): StatsPlanTierUI[] {
	// Filter out already purchased tiers.
	let tiers: StatsPlanTierUI[];

	if ( ! usageData || ( ! usageData?.views_limit && ! usageData?.billable_monthly_views ) ) {
		// No tier has been purchased or we don't have billable monthly views.
		tiers = availableTiers;
	} else {
		// Filter out tiers that have been purchased or lower than the current usage.
		tiers = availableTiers.filter( ( availableTier ) => {
			// `usageData?.current_tier?.limit` is used here to filter out the purchased tier without considering bundled views from Complete plans.
			return (
				!! availableTier.transform_quantity_divide_by ||
				( availableTier?.views as number ) >
					Math.max(
						usageData?.current_tier?.limit ?? 0,
						// The billable monthly views count already excludes plans, e.g., Complete.
						usageData?.billable_monthly_views,
						0
					)
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
	const highestTier = availableTiers[ availableTiers.length - 1 ];
	if ( availableTiers.length < MAX_TIERS_NUMBER && !! highestTier.transform_quantity_divide_by ) {
		// Calculate the number of tiers to extend based on either current purchase or billable monthly views.
		const startingTier =
			Math.floor(
				// Complete plans have 100k limit, which is less than the steps of 1M, and could be ignored here - so we could use views_limit.
				Math.max( usageData?.views_limit, usageData?.billable_monthly_views, 0 ) /
					( highestTier.transform_quantity_divide_by || 1 )
			) -
			EXTENSION_THRESHOLD_IN_MILLION +
			1;

		// Calculate the price of the current purchased tier, which may be an extended tier.
		const currentPurchaseTier = Math.floor(
			( usageData?.views_limit || 0 ) / ( highestTier.transform_quantity_divide_by || 1 )
		);
		const currentPurchaseExtendedTierCount =
			currentPurchaseTier > EXTENSION_THRESHOLD_IN_MILLION
				? currentPurchaseTier - EXTENSION_THRESHOLD_IN_MILLION
				: 0;
		const currentPurchaseTierPrice =
			( usageData?.current_tier?.minimum_price ?? 0 ) +
			( highestTier.per_unit_fee ?? 0 ) * currentPurchaseExtendedTierCount;

		// Remove the only tier that is used to extend higher tiers.
		if ( availableTiers.length === 1 && startingTier > 0 ) {
			availableTiers = availableTiers.slice( 1 );
		}

		const extendedTierCountStart = Math.max( startingTier, 1 );
		const extendedTierCountEnd = extendedTierCountStart + MAX_TIERS_NUMBER - availableTiers.length;

		for (
			let extendedTierCount = extendedTierCountStart;
			extendedTierCount < extendedTierCountEnd;
			extendedTierCount++
		) {
			const totalPrice =
				highestTier?.minimum_price + ( highestTier.per_unit_fee ?? 0 ) * extendedTierCount;
			// Avoid showing the upgrade price for extended tiers based on no purchased tier.
			const upgradePrice = currentPurchaseTierPrice > 0 ? totalPrice - currentPurchaseTierPrice : 0;
			const monthlyPriceDisplay = formatCurrency( totalPrice / 12, currencyCode, {
				isSmallestUnit: true,
				stripZeros: true,
			} );
			const views =
				( highestTier?.views ?? 0 ) +
				( highestTier.transform_quantity_divide_by ?? 0 ) * extendedTierCount;

			availableTiers.push( {
				minimum_price: totalPrice,
				upgrade_price: upgradePrice,
				price: monthlyPriceDisplay,
				views: views,
				extension: true,
			} );
		}
	}

	return availableTiers;
}

function transformTiers( price_tier_list: PriceTierEntry[] | null, currentTierPrice = 0 ) {
	return (
		price_tier_list?.map( ( tier: PriceTierEntry ): StatsPlanTierUI => {
			// TODO: Some description of transform logic here.
			// So as to clarify what we should expect from the API.
			let tierUpgradePrice = 0;

			// If there is a purchased paid tier,
			// the upgrade price is the difference between the current tier and the target tier.
			if ( currentTierPrice && tier.minimum_price > currentTierPrice ) {
				tierUpgradePrice = tier.minimum_price - currentTierPrice;
			}

			if ( tier?.maximum_units === null ) {
				// Special transformation for highest tier extension.
				return {
					minimum_price: tier.minimum_price,
					upgrade_price: tierUpgradePrice,
					price: tier.minimum_price_monthly_display ?? undefined,
					views: EXTENSION_THRESHOLD_IN_MILLION * ( tier.transform_quantity_divide_by || 1 ),
					extension: true,
					transform_quantity_divide_by: tier.transform_quantity_divide_by,
					per_unit_fee: tier.per_unit_fee ?? undefined,
				};
			}

			return {
				minimum_price: tier.minimum_price,
				upgrade_price: tierUpgradePrice,
				price: tier.minimum_price_monthly_display ?? undefined,
				views: tier.maximum_units ?? null,
			};
		} ) ?? []
	);
}

export function getAvailableUpgradeTiers(
	state: IAppState,
	usageData: PlanUsage | undefined,
	shouldFilterPurchasedTiers: boolean
): StatsPlanTierUI[] {
	// Get the tiers. Default is yearly pricing.
	const commercialProduct = getProductBySlug( state, PRODUCT_JETPACK_STATS_YEARLY );
	if ( ! commercialProduct?.price_tier_list ) {
		return [];
	}

	// Get tiers applicable for the current site.
	// We return early if we don't have any usage data to filter/extend tiers.
	const currentTierPrice = usageData?.current_tier?.minimum_price;
	let tiersForUi = transformTiers( commercialProduct?.price_tier_list, currentTierPrice );
	if ( ! usageData ) {
		return tiersForUi;
	}

	// Filter based on current plan.
	if ( shouldFilterPurchasedTiers ) {
		tiersForUi = filterLowerTiers( tiersForUi, usageData );
	}

	// Handle tiers beyond the default listing.
	const currencyCode = commercialProduct.currency_code;
	tiersForUi = extendTiersBeyondHighestTier( tiersForUi, currencyCode, usageData );

	return tiersForUi;
}

function useAvailableUpgradeTiers(
	siteId: number | null,
	shouldFilterPurchasedTiers = true
): StatsPlanTierUI[] {
	const { data: usageData } = usePlanUsageQuery( siteId );
	const tiersForUi = useSelector( ( state ) =>
		getAvailableUpgradeTiers( state, usageData, shouldFilterPurchasedTiers )
	);
	return tiersForUi;
}

export default useAvailableUpgradeTiers;
