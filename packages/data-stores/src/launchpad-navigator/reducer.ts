import { combineReducers } from '@wordpress/data';
import { LaunchpadNavigatorAction } from './actions';
import type { Reducer } from 'redux';

const currentChecklist: Reducer< string | undefined, LaunchpadNavigatorAction > = (
	state,
	action
) => {
	switch ( action.type ) {
		case 'LAUNCHPAD_NAVIGATOR_SET_CURRENT_CHECKLIST':
			return action.current_checklist;
	}
	return state;
};

const reducer = combineReducers( {
	currentChecklist,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
