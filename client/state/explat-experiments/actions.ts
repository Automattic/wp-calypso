import { loadExperimentAssignment as _loadExperimentAssignment } from 'calypso/lib/explat';
import { EXPERIMENT_ASSIGNMENT_RECEIVE } from 'calypso/state/action-types';
import type { CalypsoDispatch } from 'calypso/state/types';

export const loadExperimentAssignment = ( experimentName: string ) => {
	return async ( dispatch: CalypsoDispatch ) => {
		if ( 'calypso_post_onboarding_holdout_160125' === experimentName ) {
			const aaTestName = 'calypso_post_onboarding_aa_150125';
			await _loadExperimentAssignment( aaTestName );
		}

		const experimentAssignment = await _loadExperimentAssignment( experimentName );
		dispatch( {
			type: EXPERIMENT_ASSIGNMENT_RECEIVE,
			experimentName,
			experimentAssignment,
		} );
	};
};
