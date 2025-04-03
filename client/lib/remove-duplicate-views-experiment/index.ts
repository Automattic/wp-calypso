import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { getRemoveDuplicateViewsExperimentAssignment } from 'calypso/state/explat-experiments/actions';
import {
	getIsRemoveDuplicateViewsExperimentOverride,
	getIsRemoveDuplicateViewsExperimentEnabled,
} from 'calypso/state/explat-experiments/selectors';
import { fetchPreferences } from 'calypso/state/preferences/actions';
import { hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { AppState } from 'calypso/types';

export const REMOVE_DUPLICATE_VIEWS_EXPERIMENT = 'calypso_post_onboarding_holdout_160125';
export const REMOVE_DUPLICATE_VIEWS_EXPERIMENT_OVERRIDE =
	'remove_duplicate_views_experiment_assignment_160125';
const TREATMENT_VARIATION = 'treatment';

const loadRemoveDuplicateViewsExperimentOverride = async (
	getState: () => AppState,
	dispatch: CalypsoDispatch
) => {
	/**
	 * The overrideAssignment relies on the preferences so we have to ensure the preferences is fetched.
	 */
	if ( ! hasReceivedRemotePreferences( getState() ) ) {
		await dispatch( fetchPreferences() );
	}

	return getIsRemoveDuplicateViewsExperimentOverride( getState() );
};

export const loadRemoveDuplicateViewsExperimentAssignment = async (
	getState: () => AppState,
	dispatch: CalypsoDispatch
) => {
	/**
	 * This is for escape hatch users to override the experiment assignment: p7DVsv-m73-p2
	 */
	const overrideAssignment = await loadRemoveDuplicateViewsExperimentOverride( getState, dispatch );
	if ( overrideAssignment ) {
		return overrideAssignment;
	}

	/**
	 * If the override is not set, we force the treatment group for everyone by default.
	 */
	return TREATMENT_VARIATION;
};

export const isRemoveDuplicateViewsExperimentEnabled = async (
	getState: () => AppState,
	dispatch: CalypsoDispatch
) => await loadRemoveDuplicateViewsExperimentAssignment( getState, dispatch );

export const useRemoveDuplicateViewsExperimentEnabled = (): boolean => {
	const isEnabled = getIsRemoveDuplicateViewsExperimentEnabled();
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( getRemoveDuplicateViewsExperimentAssignment() );
	}, [ dispatch, isEnabled ] );

	return isEnabled;
};
