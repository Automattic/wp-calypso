import { combineReducers } from '@wordpress/data';
import type { LaunchpadNavigatorAction } from './actions';
import type { Reducer } from 'redux';

const activeChecklistSlug: Reducer< string | null | undefined, LaunchpadNavigatorAction > = (
	state,
	action
) => {
	switch ( action.type ) {
		case 'LAUNCHPAD_NAVIGATOR_RECEIVE_ACTIVE_CHECKLIST_SLUG':
			return action.active_checklist_slug;
	}
	return state;
};

const checklistsSlug: Reducer< string[], LaunchpadNavigatorAction > = ( state = [], action ) => {
	switch ( action.type ) {
		case 'LAUNCHPAD_NAVIGATOR_REMOVE_CHECKLIST':
			return state.filter( ( slug ) => slug !== action.checklist_slug );
		case 'LAUNCHPAD_NAVIGATOR_SET_CHECKLISTS':
			return action.checklists;
	}
	return state;
};

const reducer = combineReducers( {
	activeChecklistSlug,
	checklistsSlug,
} );

export type LaunchpadNavigatorState = ReturnType< typeof reducer >;

export default reducer;
