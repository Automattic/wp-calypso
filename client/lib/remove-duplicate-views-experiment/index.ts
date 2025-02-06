import { useEffect } from 'react';
import { loadExperimentAssignment } from 'calypso/lib/explat';
import { useDispatch, useSelector } from 'calypso/state';
import { loadRemoveDuplicateViewsExperimentAssignment } from 'calypso/state/explat-experiments/actions';
import {
	getIsRemoveDuplicateViewsExperimentOverridden,
	getIsRemoveDuplicateViewsExperimentEnabled,
} from 'calypso/state/explat-experiments/selectors';
import { AppState } from 'calypso/types';

export const REMOVE_DUPLICATE_VIEWS_EXPERIMENT = 'calypso_post_onboarding_holdout_160125';
export const REMOVE_DUPLICATE_VIEWS_EXPERIMENT_OVERRIDE =
	'remove_duplicate_views_experiment_assignment_160125';
const REMOVE_DUPLICATE_VIEWS_EXPERIMENT_AA_TEST = 'calypso_post_onboarding_aa_150125';

const _loadRemoveDuplicateViewsExperimentAssignment = async (): Promise< boolean > => {
	/**
	 * REMOVE_DUPLICATE_VIEWS_EXPERIMENT_AA_TEST should be called exactly the same number of times as REMOVE_DUPLICATE_VIEWS_EXPERIMENT.
	 * It helps ExPlat to know that the experiment is running as expected.
	 */
	const aaTestName = REMOVE_DUPLICATE_VIEWS_EXPERIMENT_AA_TEST;
	loadExperimentAssignment( aaTestName );

	const experimentAssignment = await loadExperimentAssignment( REMOVE_DUPLICATE_VIEWS_EXPERIMENT );
	return experimentAssignment?.variationName === 'treatment';
};

export const isRemoveDuplicateViewsExperimentEnabled = async ( state: AppState ) => {
	if ( getIsRemoveDuplicateViewsExperimentOverridden( state ) ) {
		return false;
	}
	return _loadRemoveDuplicateViewsExperimentAssignment();
};

export const useRemoveDuplicateViewsExperimentEnabled = (): boolean => {
	const isEnabled = useSelector( getIsRemoveDuplicateViewsExperimentEnabled );
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( loadRemoveDuplicateViewsExperimentAssignment() );
	}, [ dispatch ] );

	return isEnabled;
};
