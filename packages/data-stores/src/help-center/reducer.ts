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

const siteId: Reducer< string | number | undefined, HelpCenterAction > = (
	state = window._currentSiteId,
	action
) => {
	if ( action.type === 'HELP_CENTER_SET_SITE_ID' ) {
		return action.siteId;
	}
	return state;
};

const subject: Reducer< string | undefined, HelpCenterAction > = ( state, action ) => {
	if ( action.type === 'HELP_CENTER_SET_SUBJECT' ) {
		return action.subject;
	}
	return state;
};

const message: Reducer< string | undefined, HelpCenterAction > = ( state, action ) => {
	if ( action.type === 'HELP_CENTER_SET_MESSAGE' ) {
		return action.message;
	}
	return state;
};

const otherSiteURL: Reducer< string | undefined, HelpCenterAction > = ( state, action ) => {
	if ( action.type === 'HELP_CENTER_SET_OTHER_SITE_URL' ) {
		return action.url;
	}
	return state;
};

const popup: Reducer< Window | undefined, HelpCenterAction > = ( state, action ) => {
	if ( action.type === 'HELP_CENTER_SET_POPUP' ) {
		return action.popup;
	} else if ( action.type === 'HELP_CENTER_RESET_POPUP' ) {
		return undefined;
	}
	return state;
};

const reducer = combineReducers( {
	showHelpCenter,
	siteId,
	subject,
	message,
	otherSiteURL,
	popup,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
