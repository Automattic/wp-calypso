import { getPreference } from 'calypso/state/preferences/selectors';
import { AppState } from 'calypso/types';

export const getIsRemoveDuplicateViewsExperimentOverridden = ( state: AppState ) => {
	const overrideAssignment = getPreference(
		state,
		'remove_duplicate_views_experiment_assignment_160125'
	);

	return 'control' === overrideAssignment;
};

export const getIsRemoveDuplicateViewsExperimentEnabled = ( state: AppState ) => {
	if ( getIsRemoveDuplicateViewsExperimentOverridden( state ) ) {
		return false;
	}

	return (
		state.explatExperiments.experimentAssignments[ 'calypso_post_onboarding_holdout_160125' ] ===
		'treatment'
	);
};
