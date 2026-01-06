import { combineReducers } from '@wordpress/data';
import { Location } from 'history';
import { SiteDetails } from '../site';
import type { HelpCenterAction } from './actions';
import type { HelpCenterOptions } from './types';
import type { Reducer } from 'redux';

const showHelpCenter: Reducer< boolean | undefined, HelpCenterAction > = ( state, action ) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_SHOW':
			return action.show;
	}
	return state;
};

const typingConversationStatus: Reducer<
	Record< string, boolean > | undefined,
	HelpCenterAction
> = ( state = undefined, action ) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_TYPING_STATUS':
			return { ...state, [ action.conversationId ]: action.isTyping };
	}
	return state;
};

const zendeskConnectionStatus: Reducer<
	'disconnected' | 'reconnecting' | 'connected' | undefined,
	HelpCenterAction
> = ( state = undefined, action ) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_ZENDESK_CONNECTION_STATUS':
			return action.connectionStatus;
	}
	return state;
};

const showMessagingLauncher: Reducer< boolean | undefined, HelpCenterAction > = (
	state,
	action
) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_SHOW_MESSAGING_LAUNCHER':
			return action.show;
	}
	return state;
};

const helpCenterRouterHistory: Reducer<
	{ entries: Location[]; index: number } | undefined,
	HelpCenterAction
> = ( state, action ) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_HELP_CENTER_ROUTER_HISTORY':
			return action.history;
	}
	return state;
};

const loggedOutOdieChat: Reducer<
	{ odieId: number; sessionId: string; botSlug: string } | undefined,
	HelpCenterAction
> = ( state = undefined, action ) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_LOGGED_OUT_ODIE_CHAT':
			return action.session;
	}
	return state;
};

const showMessagingWidget: Reducer< boolean | undefined, HelpCenterAction > = ( state, action ) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_SHOW_MESSAGING_WIDGET':
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

const isChatLoaded: Reducer< boolean, HelpCenterAction > = ( state = false, action ) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_IS_CHAT_LOADED':
			return action.isChatLoaded;
	}
	return state;
};

const areSoundNotificationsEnabled: Reducer< boolean, HelpCenterAction > = (
	state = true,
	action
) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_ARE_SOUND_NOTIFICATIONS_ENABLED':
			return action.areSoundNotificationsEnabled;
	}
	return state;
};

const zendeskClientId: Reducer< string, HelpCenterAction > = ( state = '', action ) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_ZENDESK_CLIENT_ID':
			return action.zendeskClientId;
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

const navigateToRoute: Reducer< string | undefined, HelpCenterAction > = ( state, action ) => {
	if ( action.type === 'HELP_CENTER_SET_NAVIGATE_TO_ROUTE' ) {
		return action.route;
	}
	return state;
};

const odieInitialPromptText: Reducer< string | undefined, HelpCenterAction > = (
	state,
	action
) => {
	if ( action.type === 'HELP_CENTER_SET_ODIE_INITIAL_PROMPT_TEXT' ) {
		return action.text;
	}
	return state;
};

const odieBotNameSlug: Reducer< string | undefined, HelpCenterAction > = ( state, action ) => {
	if ( action.type === 'HELP_CENTER_SET_ODIE_BOT_NAME_SLUG' ) {
		return action.odieBotNameSlug;
	}
	return state;
};

const hasPremiumSupport: Reducer< boolean, HelpCenterAction > = ( state = false, action ) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_HAS_PREMIUM_SUPPORT':
			return action.allow;
	}
	return state;
};

const contextTerm: Reducer< string | undefined, HelpCenterAction > = ( state, action ) => {
	if ( action.type === 'HELP_CENTER_SET_CONTEXT_TERM' ) {
		return action.contextTerm;
	}
	return state;
};

const helpCenterOptions: Reducer< HelpCenterOptions, HelpCenterAction > = (
	state = {},
	action
) => {
	if ( action.type === 'HELP_CENTER_SET_OPTIONS' ) {
		return { ...state, ...action.options };
	}
	return state;
};

const reducer = combineReducers( {
	showHelpCenter,
	showMessagingLauncher,
	showMessagingWidget,
	zendeskConnectionStatus,
	subject,
	message,
	userDeclaredSite,
	userDeclaredSiteUrl,
	isMinimized,
	isChatLoaded,
	typingConversationStatus,
	areSoundNotificationsEnabled,
	zendeskClientId,
	unreadCount,
	navigateToRoute,
	odieInitialPromptText,
	odieBotNameSlug,
	helpCenterRouterHistory,
	loggedOutOdieChat,
	hasPremiumSupport,
	contextTerm,
	helpCenterOptions,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
