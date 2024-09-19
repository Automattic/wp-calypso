import { CostOverride, PricedAPISitePlan } from '../../types';

/**
 * Unpacks cost overrides from an API plan to the respective `PlanCostOverride` structure for the store.
 */
export default function unpackCostOverrides( plan: PricedAPISitePlan ): CostOverride[] | undefined {
	if ( ! plan?.cost_overrides?.length ) {
		return undefined;
	}
	return plan?.cost_overrides?.map( ( costOverride ) => ( {
		doesOverrideOriginalCost: costOverride.does_override_original_cost,
		firstUnitOnly: costOverride.first_unit_only,
		newPrice: costOverride.new_price,
		oldPrice: costOverride.old_price,
		overrideCode: costOverride.override_code,
		percentage: costOverride.percentage,
	} ) );
}
