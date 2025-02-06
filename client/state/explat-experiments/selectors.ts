import {
	REMOVE_DUPLICATE_VIEWS_EXPERIMENT,
	REMOVE_DUPLICATE_VIEWS_EXPERIMENT_OVERRIDE,
} from 'calypso/lib/remove-duplicate-views-experiment';
import { getPreference } from 'calypso/state/preferences/selectors';
import { AppState } from 'calypso/types';

import 'calypso/state/explat-experiments/init';

export const getIsRemoveDuplicateViewsExperimentOverridden = ( state: AppState ) => {
	const overrideAssignment = getPreference( state, REMOVE_DUPLICATE_VIEWS_EXPERIMENT_OVERRIDE );
	return overrideAssignment;
};

export const getIsRemoveDuplicateViewsExperimentEnabled = ( state: AppState ) => {
	if ( getIsRemoveDuplicateViewsExperimentOverridden( state ) ) {
		return false;
	}

	return (
		state.explatExperiments.experimentAssignments[ REMOVE_DUPLICATE_VIEWS_EXPERIMENT ] ===
		'treatment'
	);
};
