import { useExperiment } from 'calypso/lib/explat';

const REMOVE_FOCUSED_LAUNCHPAD_EXPERIMENT_NAME =
	'calypso_signup_simplified_onboarding_remove_focused_launchpad';

export function useRemoveFocusedLaunchpadExperiment(): [ boolean, boolean | null ] {
	const [ isLoadingExperiment, assignment ] = useExperiment(
		REMOVE_FOCUSED_LAUNCHPAD_EXPERIMENT_NAME
	);
	const isTreatment = assignment?.variationName === 'treatment';

	return [ isLoadingExperiment, isTreatment ];
}
