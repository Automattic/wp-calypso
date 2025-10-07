export function useStreamlinedPriceExperiment(): [ boolean, string | null ] {
	return [ false, 'plans_1Y_checkout_radio' ];
}

export function isStreamlinedPricePlansTreatment( variationName?: string | null ) {
	if ( ! variationName ) {
		return false;
	}
	return ! variationName.includes( 'plans_control' );
}

export function isStreamlinedPriceCheckoutTreatment( variationName?: string | null ) {
	if ( ! variationName ) {
		return false;
	}
	return ! variationName.includes( 'checkout_control' );
}

export function isStreamlinedPriceRadioTreatment( variationName?: string | null ) {
	if ( ! variationName ) {
		return false;
	}
	return variationName.includes( 'checkout_radio' );
}
