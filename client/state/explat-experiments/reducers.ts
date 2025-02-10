import { EXPERIMENT_ASSIGNMENT_RECEIVE } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import type { AnyAction } from 'redux';

const experimentAssignments = ( state: Record< string, string > = {}, action: AnyAction ) => {
	switch ( action.type ) {
		case EXPERIMENT_ASSIGNMENT_RECEIVE:
			return {
				...state,
				[ action.experimentName ]: action.experimentAssignment,
			};
		default:
			return state;
	}
};

export default combineReducers( {
	experimentAssignments,
} );
