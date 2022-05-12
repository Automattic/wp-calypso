import { SiteDetails } from '../site';

export const setShowHelpCenter = ( show: boolean ) =>
	( {
		type: 'HELP_CENTER_SET_SHOW',
		show,
	} as const );

export const setSite = ( site: SiteDetails | undefined ) =>
	( {
		type: 'HELP_CENTER_SET_SITE',
		site,
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

export const setPopup = ( popup: Window ) =>
	( {
		type: 'HELP_CENTER_SET_POPUP',
		popup,
	} as const );

export const resetPopup = () =>
	( {
		type: 'HELP_CENTER_RESET_POPUP',
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

export const resetStore = () =>
	( {
		type: 'HELP_CENTER_RESET_STORE',
	} as const );

export type HelpCenterAction = ReturnType<
	| typeof setShowHelpCenter
	| typeof setSite
	| typeof setSubject
	| typeof resetStore
	| typeof setMessage
	| typeof setUserDeclaredSite
	| typeof setUserDeclaredSiteUrl
	| typeof resetPopup
	| typeof setPopup
>;
