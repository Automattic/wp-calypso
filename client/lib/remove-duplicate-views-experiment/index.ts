import { Context } from '@automattic/calypso-router';
import { useEffect } from 'react';
import { loadExperimentAssignment } from 'calypso/lib/explat';
import { useDispatch, useSelector } from 'calypso/state';
import { loadRemoveDuplicateViewsExperimentAssignment } from 'calypso/state/explat-experiments/actions';
import {
	getIsRemoveDuplicateViewsExperimentOverridden,
	getIsRemoveDuplicateViewsExperimentEnabled as _getIsRemoveDuplicateViewsExperimentEnabled,
} from 'calypso/state/explat-experiments/selectors';

const REMOVE_DUPLICATE_VIEWS_EXPERIMENT = 'calypso_post_onboarding_holdout_160125';

export const getIsRemoveDuplicateViewsExperimentEnabled = async (): Promise< boolean > => {
	const aaTestName = 'calypso_post_onboarding_aa_150125';
	loadExperimentAssignment( aaTestName );

	const experimentAssignment = await loadExperimentAssignment( REMOVE_DUPLICATE_VIEWS_EXPERIMENT );
	return experimentAssignment?.variationName === 'treatment';
};

export const isRemoveDuplicateViewsExperimentEnabled = async ( context: Context ) => {
	if ( getIsRemoveDuplicateViewsExperimentOverridden( context.store.getState() ) ) {
		return false;
	}
	return getIsRemoveDuplicateViewsExperimentEnabled();
};

export const useRemoveDuplicateViewsExperimentEnabled = (): boolean => {
	const isEnabled = useSelector( _getIsRemoveDuplicateViewsExperimentEnabled );
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( loadRemoveDuplicateViewsExperimentAssignment() );
	}, [ dispatch ] );

	return isEnabled;
};
