import { isE2ETest } from 'calypso/lib/e2e';
import {
	REMOVE_DUPLICATE_VIEWS_EXPERIMENT,
	REMOVE_DUPLICATE_VIEWS_EXPERIMENT_OVERRIDE,
} from 'calypso/lib/remove-duplicate-views-experiment';
import { getPreference } from 'calypso/state/preferences/selectors';
import { AppState } from 'calypso/types';

import 'calypso/state/explat-experiments/init';

export const getIsExperimentEnabled = ( state: AppState, experimentName: string ) => {
	if ( state.explatExperiments.experimentAssignments[ experimentName ] === 'treatment' ) {
		return true;
	}

	/**
	 * If we don't update the E2E tests, they will break when we start the "Remove duplicate views",
	 * effectively blocking the Calypso deployment queue.
	 */
	if ( isE2ETest() ) {
		return true;
	}

	return false;
};

export const getIsRemoveDuplicateViewsExperimentEnabled = ( state: AppState ) => {
	return getIsExperimentEnabled( state, REMOVE_DUPLICATE_VIEWS_EXPERIMENT );
};

export const getIsRemoveDuplicateViewsExperimentOverride = ( state: AppState ) => {
	const overrideAssignment = getPreference( state, REMOVE_DUPLICATE_VIEWS_EXPERIMENT_OVERRIDE );
	return overrideAssignment;
};
