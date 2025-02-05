import { useEffect, useState } from 'react';
import { loadExperimentAssignment } from 'calypso/lib/explat';

const EXPERIMENT_NAME = 'calypso_post_onboarding_holdout_160125';

export const getIsRemoveDuplicateViewsExperimentEnabled = async (): Promise< boolean > => {
	const experimentAssignment = await loadExperimentAssignment( EXPERIMENT_NAME );
	return experimentAssignment?.variationName === 'treatment';
};

export const useRemoveDuplicateViewsExperimentEnabled = (): boolean => {
	const [ isRemoveDuplicateViewsExperimentEnabled, setIsRemoveDuplicateViewsExperimentEnabled ] =
		useState( false );

	useEffect( () => {
		getIsRemoveDuplicateViewsExperimentEnabled().then( setIsRemoveDuplicateViewsExperimentEnabled );
	}, [] );

	return isRemoveDuplicateViewsExperimentEnabled;
};
