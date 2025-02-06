import { loadExperimentAssignment as _loadExperimentAssignment } from 'calypso/lib/explat';
import {
	REMOVE_DUPLICATE_VIEWS_EXPERIMENT,
	isRemoveDuplicateViewsExperimentEnabled,
} from 'calypso/lib/remove-duplicate-views-experiment';
import { EXPERIMENT_ASSIGNMENT_RECEIVE } from 'calypso/state/action-types';
import { AppState } from 'calypso/types';
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
	return async ( dispatch: CalypsoDispatch, getState: () => AppState ) => {
		const state = getState();
		const experimentAssignment = await isRemoveDuplicateViewsExperimentEnabled( state );
		dispatch( {
			type: EXPERIMENT_ASSIGNMENT_RECEIVE,
			experimentName: REMOVE_DUPLICATE_VIEWS_EXPERIMENT,
			experimentAssignment,
		} );
	};
};
