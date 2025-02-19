import { useEffect } from 'react';
import { isE2ETest } from 'calypso/lib/e2e';
import { loadExperimentAssignment } from 'calypso/lib/explat';
import { useDispatch, useSelector } from 'calypso/state';
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
const REMOVE_DUPLICATE_VIEWS_EXPERIMENT_AA_TEST = 'calypso_post_onboarding_aa_150125';

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
	 * REMOVE_DUPLICATE_VIEWS_EXPERIMENT_AA_TEST should be called exactly the same number of times as REMOVE_DUPLICATE_VIEWS_EXPERIMENT.
	 * It helps ExPlat to know that the experiment is running as expected.
	 */
	const aaTestName = REMOVE_DUPLICATE_VIEWS_EXPERIMENT_AA_TEST;
	loadExperimentAssignment( aaTestName );

	const experimentAssignment = await loadExperimentAssignment( REMOVE_DUPLICATE_VIEWS_EXPERIMENT );
	return experimentAssignment?.variationName;
};

export const isRemoveDuplicateViewsExperimentEnabled = async (
	getState: () => AppState,
	dispatch: CalypsoDispatch
) => {
	const experimentAssignment = await loadRemoveDuplicateViewsExperimentAssignment(
		getState,
		dispatch
	);
	if ( experimentAssignment === 'treatment' ) {
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

export const useRemoveDuplicateViewsExperimentEnabled = (): boolean => {
	const isEnabled = useSelector( ( state: AppState ) => {
		return getIsRemoveDuplicateViewsExperimentEnabled( state );
	} );
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( getRemoveDuplicateViewsExperimentAssignment() );
	}, [ dispatch, isEnabled ] );

	return isEnabled;
};
