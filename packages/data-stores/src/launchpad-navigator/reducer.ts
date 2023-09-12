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

const reducer = combineReducers( {
	activeChecklistSlug,
} );

export type LaunchpadNavigatorState = ReturnType< typeof reducer >;

export default reducer;
