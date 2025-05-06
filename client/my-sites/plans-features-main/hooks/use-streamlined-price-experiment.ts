import { useExperiment, loadExperimentAssignment } from 'calypso/lib/explat';

const STREAMLINED_PRICE_EXPERIMENT_NAME = 'calypso_streamlined_plans_checkout';

export function useStreamlinedPriceExperiment(): [ boolean, string | null ] {
	const [ isLoading, assignment ] = useExperiment( STREAMLINED_PRICE_EXPERIMENT_NAME );
	return [ isLoading, assignment?.variationName ?? null ];
}

export async function isStreamlinedPriceExperiment() {
	const assignment = await loadExperimentAssignment( STREAMLINED_PRICE_EXPERIMENT_NAME );
	return assignment?.variationName !== null;
}

export function isStreamlinedPricePlansTreatment( variationName?: string | null ) {
	if ( ! variationName ) {
		return false;
	}
	return ! variationName.includes( 'plans_control' );
}

export function isStreamlinedPriceRadioTreatment( variationName?: string | null ) {
	if ( ! variationName ) {
		return false;
	}
	return variationName.includes( 'checkout_radio' );
}
