export const setShowHelpCenter = ( show: boolean ) =>
	( {
		type: 'HELP_CENTER_SET_SHOW',
		show,
	} as const );

export const setSiteId = ( siteId: string | number ) =>
	( {
		type: 'HELP_CENTER_SET_SITE_ID',
		siteId,
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

export const setOtherSiteURL = ( url: string ) =>
	( {
		type: 'HELP_CENTER_SET_OTHER_SITE_URL',
		url,
	} as const );

export type HelpCenterAction = ReturnType<
	| typeof setShowHelpCenter
	| typeof setSiteId
	| typeof setSubject
	| typeof setMessage
	| typeof setOtherSiteURL
	| typeof resetPopup
	| typeof setPopup
>;
