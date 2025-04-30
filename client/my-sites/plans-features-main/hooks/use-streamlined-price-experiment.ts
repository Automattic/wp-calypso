import { useExperiment, loadExperimentAssignment } from 'calypso/lib/explat';

const STREAMLINED_PRICE_EXPERIMENT_NAME = 'calypso_streamlined_plans_checkout';

export function useStreamlinedPriceExperiment() {
	const [ isLoading, assignment ] = useExperiment( STREAMLINED_PRICE_EXPERIMENT_NAME );
	return [ isLoading, assignment?.variationName ];
}

export async function isStreamlinedPriceExperiment() {
	const assignment = await loadExperimentAssignment( STREAMLINED_PRICE_EXPERIMENT_NAME );
	return assignment?.variationName !== null;
}
