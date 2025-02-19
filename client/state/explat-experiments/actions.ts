import { loadExperimentAssignment } from 'calypso/lib/explat';
import {
	REMOVE_DUPLICATE_VIEWS_EXPERIMENT,
	loadRemoveDuplicateViewsExperimentAssignment,
} from 'calypso/lib/remove-duplicate-views-experiment';
import { EXPERIMENT_ASSIGNMENT_RECEIVE } from 'calypso/state/action-types';
import { AppState } from 'calypso/types';
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

export const getRemoveDuplicateViewsExperimentAssignment = () => {
	return async ( dispatch: CalypsoDispatch, getState: () => AppState ) => {
		const experimentAssignment = await loadRemoveDuplicateViewsExperimentAssignment(
			getState,
			dispatch
		);
		dispatch( {
			type: EXPERIMENT_ASSIGNMENT_RECEIVE,
			experimentName: REMOVE_DUPLICATE_VIEWS_EXPERIMENT,
			experimentAssignment,
		} );
	};
};
