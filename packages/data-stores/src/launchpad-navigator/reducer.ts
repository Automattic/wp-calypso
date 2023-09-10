import { combineReducers } from '@wordpress/data';
import type { LaunchpadNavigatorAction } from './actions';
import type { Reducer } from 'redux';

const currentChecklist: Reducer< string | null | undefined, LaunchpadNavigatorAction > = (
	state,
	action
) => {
	switch ( action.type ) {
		case 'LAUNCHPAD_NAVIGATOR_RECEIVE_CURRENT_CHECKLIST':
			return action.current_checklist;
	}
	return state;
};

const reducer = combineReducers( {
	currentChecklist,
} );

export type LaunchpadNavigatorState = ReturnType< typeof reducer >;

export default reducer;
