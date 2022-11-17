import { combineReducers } from '@wordpress/data';
import { SiteDetails } from '../site';
import type { HelpCenterAction } from './actions';
import type { Location, HelpCenterSite } from './types';
import type { Reducer } from 'redux';

const showHelpCenter: Reducer< boolean | undefined, HelpCenterAction > = ( state, action ) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_SHOW':
			return action.show;
	}
	return state;
};

const isMinimized: Reducer< boolean, HelpCenterAction > = ( state = false, action ) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_MINIMIZED':
			return action.minimized;
	}
	return state;
};

const site: Reducer< HelpCenterSite | undefined, HelpCenterAction > = ( state, action ) => {
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

const unreadCount: Reducer< number, HelpCenterAction > = ( state = 0, action ) => {
	if ( action.type === 'HELP_CENTER_SET_UNREAD_COUNT' ) {
		return action.count;
	} else if ( action.type === 'HELP_CENTER_RESET_STORE' ) {
		return 0;
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

const routerState: Reducer< { history: Location[] | undefined; index: number | undefined } > = (
	state = { history: undefined, index: undefined },
	action
) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_ROUTER_STATE':
			return { history: action.history, index: action.index };
	}
	return state;
};

const reducer = combineReducers( {
	showHelpCenter,
	site,
	subject,
	message,
	userDeclaredSite,
	userDeclaredSiteUrl,
	isMinimized,
	unreadCount,
	iframe,
	routerState,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
