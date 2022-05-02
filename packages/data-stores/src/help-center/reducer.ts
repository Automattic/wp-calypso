import { combineReducers } from '@wordpress/data';
import type { HelpCenterAction } from './actions';
import type { Reducer } from 'redux';

const showHelpCenter: Reducer< boolean | undefined, HelpCenterAction > = ( state, action ) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_SHOW':
			return action.show;
	}
	return state;
};

const hasSeenWhatsNewModal: Reducer< boolean | undefined, HelpCenterAction > = (
	state,
	action
) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_HAS_SEEN_WHATS_NEW_MODAL':
			return action.hasSeenWhatsNewModal;
		case 'HELP_CENTER_FETCH_STATUS_SUCCESS':
			return action.response.has_seen_whats_new_modal;
	}
	return state;
};

const reducer = combineReducers( {
	showHelpCenter,
	hasSeenWhatsNewModal,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
