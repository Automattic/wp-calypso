import { loadExperimentAssignment } from 'calypso/lib/explat';
import { EXPERIMENT_ASSIGNMENT_RECEIVE } from 'calypso/state/action-types';
import type { CalypsoDispatch } from 'calypso/state/types';

import 'calypso/state/explat-experiments/init';

export const getExperimentAssignment = ( experimentName: string ) => {
	return async ( dispatch: CalypsoDispatch ) => {
		const experimentAssignment = await loadExperimentAssignment( experimentName );
		dispatch( {
			type: EXPERIMENT_ASSIGNMENT_RECEIVE,
			experimentName,
			experimentAssignment,
		} );
	};
};
