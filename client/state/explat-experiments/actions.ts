import { loadExperimentAssignment as _loadExperimentAssignment } from 'calypso/lib/explat';
import { EXPERIMENT_ASSIGNMENT_RECEIVE } from 'calypso/state/action-types';
import type { CalypsoDispatch } from 'calypso/state/types';

export const loadExperimentAssignment = ( experimentName: string ) => {
	return async ( dispatch: CalypsoDispatch ) => {
		const experimentAssignment = await _loadExperimentAssignment( experimentName );
		dispatch( {
			type: EXPERIMENT_ASSIGNMENT_RECEIVE,
			experimentName,
			experimentAssignment,
		} );
	};
};

export const loadRemoveDuplicateViewsExperimentAssignment = () => {
	return async ( dispatch: CalypsoDispatch ) => {
		const aaTestName = 'calypso_post_onboarding_aa_150125';
		_loadExperimentAssignment( aaTestName );

		const experimentAssignment = await _loadExperimentAssignment(
			'calypso_post_onboarding_holdout_160125'
		);
		dispatch( {
			type: EXPERIMENT_ASSIGNMENT_RECEIVE,
			experimentName: 'calypso_post_onboarding_holdout_160125',
			experimentAssignment,
		} );
	};
};
