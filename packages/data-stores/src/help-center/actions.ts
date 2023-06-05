import { InitialEntry } from '@remix-run/router';
import { apiFetch } from '@wordpress/data-controls';
import { canAccessWpcomApis } from 'wpcom-proxy-request';
import { GeneratorReturnType } from '../mapped-types';
import { SiteDetails } from '../site';
import { wpcomRequest } from '../wpcom-request-controls';
import type { APIFetchOptions, HelpCenterSite } from './types';

export const receiveHasSeenWhatsNewModal = ( value: boolean | undefined ) =>
	( {
		type: 'HELP_CENTER_SET_SEEN_WHATS_NEW_MODAL',
		value,
	} as const );

export function* setHasSeenWhatsNewModal( value: boolean ) {
	let response: {
		has_seen_whats_new_modal: boolean;
	};
	if ( canAccessWpcomApis() ) {
		response = yield wpcomRequest( {
			path: `/block-editor/has-seen-whats-new-modal`,
			apiNamespace: 'wpcom/v2',
			method: 'PUT',
			body: {
				has_seen_whats_new_modal: value,
			},
		} );
	} else {
		response = yield apiFetch( {
			global: true,
			path: `/wpcom/v2/block-editor/has-seen-whats-new-modal`,
			method: 'PUT',
			data: { has_seen_whats_new_modal: value },
		} as APIFetchOptions );
	}

	return receiveHasSeenWhatsNewModal( response.has_seen_whats_new_modal );
}

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

export const setInitialRoute = ( route?: InitialEntry ) =>
	( {
		type: 'HELP_CENTER_SET_INITIAL_ROUTE',
		route,
	} as const );

export const setIsMinimized = ( minimized: boolean ) =>
	( {
		type: 'HELP_CENTER_SET_MINIMIZED',
		minimized,
	} as const );

export const setShowMessagingLauncher = ( show: boolean ) =>
	( {
		type: 'HELP_CENTER_SET_SHOW_MESSAGING_LAUNCHER',
		show,
	} as const );

export const setShowMessagingWidget = ( show: boolean ) =>
	( {
		type: 'HELP_CENTER_SET_SHOW_MESSAGING_WIDGET',
		show,
	} as const );

export const setShowHelpCenter = function* ( show: boolean ) {
	if ( ! show ) {
		yield setInitialRoute( undefined );
		yield setIsMinimized( false );
	} else {
		yield setShowMessagingWidget( false );
	}

	return {
		type: 'HELP_CENTER_SET_SHOW',
		show,
	} as const;
};

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

export const setChatTag = ( chatTag: string ) =>
	( {
		type: 'HELP_CENTER_SET_CHAT_TAG',
		chatTag,
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

export const resetStore = () =>
	( {
		type: 'HELP_CENTER_RESET_STORE',
	} as const );

export const startHelpCenterChat = function* ( site: HelpCenterSite, message: string ) {
	yield setInitialRoute( '/contact-form?mode=CHAT' );
	yield setSite( site );
	yield setMessage( message );
	yield setShowHelpCenter( true );
};

export const setShowMessagingChat = function* () {
	yield setShowHelpCenter( false );
	yield setShowMessagingLauncher( true );
	yield setShowMessagingWidget( true );
	yield resetStore();
};

export type HelpCenterAction =
	| ReturnType<
			| typeof setShowMessagingLauncher
			| typeof setShowMessagingWidget
			| typeof setSite
			| typeof setSubject
			| typeof resetStore
			| typeof receiveHasSeenWhatsNewModal
			| typeof setMessage
			| typeof setChatTag
			| typeof setUserDeclaredSite
			| typeof setUserDeclaredSiteUrl
			| typeof resetIframe
			| typeof setIframe
			| typeof setUnreadCount
			| typeof setIsMinimized
			| typeof setInitialRoute
	  >
	| GeneratorReturnType< typeof setShowHelpCenter | typeof setHasSeenWhatsNewModal >;
