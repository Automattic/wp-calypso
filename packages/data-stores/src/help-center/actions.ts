import { SiteDetails } from '../site';
import { Location, HelpCenterSite } from './types';

export const setShowHelpCenter = ( show: boolean ) =>
	( {
		type: 'HELP_CENTER_SET_SHOW',
		show,
	} as const );

export const setRouterState = ( history: Location[], index: number ) =>
	( {
		type: 'HELP_CENTER_SET_ROUTER_STATE',
		history,
		index,
	} as const );

export const resetRouterState = () =>
	( {
		type: 'HELP_CENTER_SET_ROUTER_STATE',
		history: undefined,
		index: undefined,
	} as const );

export const setSite = ( site: HelpCenterSite | undefined ) =>
	( {
		type: 'HELP_CENTER_SET_SITE',
		site,
	} as const );

export const setUnreadCount = ( count: number ) =>
	( {
		type: 'HELP_CENTER_SET_UNREAD_COUNT',
		count,
	} as const );

export const setIsMinimized = ( minimized: boolean ) =>
	( {
		type: 'HELP_CENTER_SET_MINIMIZED',
		minimized,
	} as const );

export const setSubject = ( subject: string ) =>
	( {
		type: 'HELP_CENTER_SET_SUBJECT',
		subject,
	} as const );

export const setMessage = ( message: string ) =>
	( {
		type: 'HELP_CENTER_SET_MESSAGE',
		message,
	} as const );

export const setIframe = ( iframe: null | HTMLIFrameElement ) =>
	( {
		type: 'HELP_CENTER_SET_IFRAME',
		iframe,
	} as const );

export const resetIframe = () =>
	( {
		type: 'HELP_CENTER_RESET_IFRAME',
	} as const );

export const setUserDeclaredSiteUrl = ( url: string ) =>
	( {
		type: 'HELP_CENTER_SET_USER_DECLARED_SITE_URL',
		url,
	} as const );

export const setUserDeclaredSite = ( site: SiteDetails | undefined ) =>
	( {
		type: 'HELP_CENTER_SET_USER_DECLARED_SITE',
		site,
	} as const );

export const startHelpCenterChat = function* ( site: HelpCenterSite, message: string ) {
	yield setRouterState( [ { pathname: '/inline-chat' } ], 0 );
	yield setSite( site );
	yield setMessage( message );
	yield setShowHelpCenter( true );
};

export const resetStore = () =>
	( {
		type: 'HELP_CENTER_RESET_STORE',
	} as const );

export type HelpCenterAction = ReturnType<
	| typeof setShowHelpCenter
	| typeof setSite
	| typeof setSubject
	| typeof setRouterState
	| typeof resetRouterState
	| typeof resetStore
	| typeof setMessage
	| typeof setUserDeclaredSite
	| typeof setUserDeclaredSiteUrl
	| typeof resetIframe
	| typeof setIframe
	| typeof setUnreadCount
	| typeof setIsMinimized
>;
