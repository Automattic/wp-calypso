import { useExperiment, loadExperimentAssignment } from 'calypso/lib/explat';

const UNIFIED_LAUNCH_EXPERIMENT_NAME = 'calypso_standardized_site_launch_gating';

export function useUnifiedLaunchExperiment() {
	const [ isLoading, assignment ] = useExperiment( UNIFIED_LAUNCH_EXPERIMENT_NAME );

	return [ isLoading, assignment?.variationName ];
}

export async function isUnifiedLaunchExperiment() {
	const assignment = await loadExperimentAssignment( UNIFIED_LAUNCH_EXPERIMENT_NAME );
	return assignment.variationName !== 'control';
}
