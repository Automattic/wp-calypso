import { combineReducers } from '@wordpress/data';
import { SiteDetails } from '../site';
import type { HelpCenterAction } from './actions';
import type { Reducer } from 'redux';

const showHelpCenter: Reducer< boolean | undefined, HelpCenterAction > = ( state, action ) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_SHOW':
			return action.show;
	}
	return state;
};

const directlyData: Reducer<
	{ isLoaded: boolean; hasSession: boolean } | undefined,
	HelpCenterAction
> = ( state, action ) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_DIRECTLY_DATA':
			return action.data;
	}
	return state;
};

const site: Reducer< SiteDetails | undefined, HelpCenterAction > = ( state, action ) => {
	if ( action.type === 'HELP_CENTER_RESET_STORE' ) {
		return undefined;
	} else if ( action.type === 'HELP_CENTER_SET_SITE' ) {
		return action.site;
	}
	return state;
};

const subject: Reducer< string | undefined, HelpCenterAction > = ( state, action ) => {
	if ( action.type === 'HELP_CENTER_RESET_STORE' ) {
		return undefined;
	} else if ( action.type === 'HELP_CENTER_SET_SUBJECT' ) {
		return action.subject;
	}
	return state;
};

const message: Reducer< string | undefined, HelpCenterAction > = ( state, action ) => {
	if ( action.type === 'HELP_CENTER_RESET_STORE' ) {
		return undefined;
	} else if ( action.type === 'HELP_CENTER_SET_MESSAGE' ) {
		return action.message;
	}
	return state;
};

const userDeclaredSiteUrl: Reducer< string | undefined, HelpCenterAction > = ( state, action ) => {
	if ( action.type === 'HELP_CENTER_RESET_STORE' ) {
		return undefined;
	} else if ( action.type === 'HELP_CENTER_SET_USER_DECLARED_SITE_URL' ) {
		return action.url;
	}
	return state;
};

const userDeclaredSite: Reducer< SiteDetails | undefined, HelpCenterAction > = (
	state,
	action
) => {
	if ( action.type === 'HELP_CENTER_RESET_STORE' ) {
		return undefined;
	} else if ( action.type === 'HELP_CENTER_SET_USER_DECLARED_SITE' ) {
		return action.site;
	}
	return state;
};

const iframe: Reducer< HTMLIFrameElement | undefined | null, HelpCenterAction > = (
	state,
	action
) => {
	if ( action.type === 'HELP_CENTER_SET_IFRAME' ) {
		return action.iframe;
	} else if ( action.type === 'HELP_CENTER_RESET_IFRAME' ) {
		return undefined;
	}
	return state;
};

const reducer = combineReducers( {
	directlyData,
	showHelpCenter,
	site,
	subject,
	message,
	userDeclaredSite,
	userDeclaredSiteUrl,
	iframe,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
