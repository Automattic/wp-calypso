export interface PriceTierEntry {
	minimum_units: number;
	maximum_units?: undefined | null | number;
	minimum_price: number;
	minimum_price_display: string;
	minimum_price_monthly_display?: string | null | undefined;
	maximum_price: number;
	maximum_price_display?: string | null | undefined;
	maximum_price_monthly_display?: string | null | undefined;
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
