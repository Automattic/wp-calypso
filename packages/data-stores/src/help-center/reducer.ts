import { combineReducers } from '@wordpress/data';
import { SiteDetails } from '../site';
import type { HelpCenterAction } from './actions';
import type { HelpCenterOptions } from './types';
import type { SupportInteraction } from '@automattic/odie-client/src/types';
import type { Reducer } from 'redux';

const showHelpCenter: Reducer< boolean | undefined, HelpCenterAction > = ( state, action ) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_SHOW':
			return action.show;
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

const showMessagingWidget: Reducer< boolean | undefined, HelpCenterAction > = ( state, action ) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_SHOW_MESSAGING_WIDGET':
			return action.show;
	}
	return state;
};

const hasSeenWhatsNewModal: Reducer< boolean | undefined, HelpCenterAction > = (
	state,
	action
) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_SEEN_WHATS_NEW_MODAL':
			return action.value;
	}
	return state;
};

const currentSupportInteraction: Reducer< SupportInteraction | undefined, HelpCenterAction > = (
	state,
	action
) => {
	if ( action.type === 'HELP_CENTER_SET_CURRENT_SUPPORT_INTERACTION' ) {
		return action.supportInteraction;
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

const allowPremiumSupport: Reducer< boolean, HelpCenterAction > = ( state = false, action ) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_ALLOW_PREMIUM_SUPPORT':
			return action.allow;
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
	currentSupportInteraction,
	showHelpCenter,
	showMessagingLauncher,
	showMessagingWidget,
	subject,
	message,
	userDeclaredSite,
	userDeclaredSiteUrl,
	hasSeenWhatsNewModal,
	isMinimized,
	isChatLoaded,
	areSoundNotificationsEnabled,
	zendeskClientId,
	unreadCount,
	navigateToRoute,
	odieInitialPromptText,
	odieBotNameSlug,
	allowPremiumSupport,
	helpCenterOptions,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
