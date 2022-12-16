import { apiFetch } from '@wordpress/data-controls';
import { canAccessWpcomApis } from 'wpcom-proxy-request';
import { GeneratorReturnType } from '../mapped-types';
import { SiteDetails } from '../site';
import { wpcomRequest } from '../wpcom-request-controls';
import { HAS_SEEN_PREF_KEY } from './constants';
import type { Location, APIFetchOptions, HelpCenterSite } from './types';

export const setRouterState = ( history: Location[], index: number ) =>
	( {
		type: 'HELP_CENTER_SET_ROUTER_STATE',
		history,
		index,
	} as const );

export const receiveHasSeenPromotionalPopover = ( value: boolean | undefined ) =>
	( {
		type: 'HELP_CENTER_SET_SEEN_PROMOTIONAL_POPOVER',
		value,
	} as const );

export function* setHasSeenPromotionalPopover( value: boolean ) {
	let response: { [ HAS_SEEN_PREF_KEY ]: boolean };
	if ( canAccessWpcomApis() ) {
		response = yield wpcomRequest( {
			path: `me/preferences`,
			apiNamespace: 'wpcom/v2/',
			apiVersion: '2',
			method: 'POST',
			body: {
				calypso_preferences: {
					[ HAS_SEEN_PREF_KEY ]: value,
				},
			},
		} );
	} else {
		response = yield apiFetch( {
			global: true,
			path: '/help-center/has-seen-promotion',
			method: 'POST',
		} as APIFetchOptions );
	}

	return receiveHasSeenPromotionalPopover( response[ HAS_SEEN_PREF_KEY ] );
}

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

export const setShowHelpCenter = function* ( show: boolean ) {
	if ( ! show ) {
		// reset minimized state when the help center is closed
		yield setIsMinimized( false );
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

export type HelpCenterAction =
	| ReturnType<
			| typeof setSite
			| typeof setSubject
			| typeof setRouterState
			| typeof resetRouterState
			| typeof resetStore
			| typeof receiveHasSeenPromotionalPopover
			| typeof receiveHasSeenWhatsNewModal
			| typeof setMessage
			| typeof setUserDeclaredSite
			| typeof setUserDeclaredSiteUrl
			| typeof resetIframe
			| typeof setIframe
			| typeof setUnreadCount
			| typeof setIsMinimized
	  >
	| GeneratorReturnType<
			| typeof setHasSeenPromotionalPopover
			| typeof setShowHelpCenter
			| typeof setHasSeenWhatsNewModal
	  >;
