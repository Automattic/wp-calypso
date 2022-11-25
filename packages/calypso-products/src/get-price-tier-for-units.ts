export interface PriceTierEntry {
	minimum_units: number;
	maximum_units?: undefined | null | number;
	minimum_price: number;
	minimum_price_display: string;
	minimum_price_monthly_display?: string | null | undefined;
	maximum_price: number;
	maximum_price_display?: string | null | undefined;
	maximum_price_monthly_display?: string | null | undefined;
	/**
	 * If set, is used to transform the usage/quantity of units used to derive the number of units
	 * we want to bill the customer for, before multiplying by the per_unit_fee.
	 *
	 * To put simply, the purpose of this attribute is to bill the customer at a different granularity compared to their usage.
	 */
	transform_quantity_divide_by?: number | null | undefined;
	/**
	 * Used for rounding the number of units we want to bill the customer for (which is derived after dividing the
	 * usage/quantity of units by the `transform_quantity_divide_by` number).
	 *
	 * Used only when `transform_quantity_divide_by` is set. Possible values are: `up`, `down`
	 */
	transform_quantity_round?: string | null | undefined;
	/**
	 * The amount in the currency's smallest unit that this tier costs per unit.
	 */
	per_unit_fee?: number | null | undefined;
	/**
	 * The amount in the currency's smallest unit that this tier costs as a flat fee (for the entire tier).
	 */
	flat_fee?: number | null | undefined;
}

export function getPriceTierForUnits(
	tiers: PriceTierEntry[],
	units: number
): PriceTierEntry | null {
	const firstUnboundedTier = tiers.find( ( tier ) => ! tier.maximum_units );
	let matchingTier = tiers.find( ( tier ) => {
		if ( ! tier.maximum_units ) {
			return false;
		}
		if ( units >= tier.minimum_units && units <= tier.maximum_units ) {
			return true;
		}
		return false;
	} );
	if ( ! matchingTier && firstUnboundedTier && units >= firstUnboundedTier.minimum_units ) {
		matchingTier = firstUnboundedTier;
	}

	if ( ! matchingTier ) {
		return null;
	}
	return matchingTier;
}
