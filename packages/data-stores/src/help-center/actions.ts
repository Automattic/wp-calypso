import { apiFetch } from '@wordpress/data-controls';
import { canAccessWpcomApis } from 'wpcom-proxy-request';
import { GeneratorReturnType } from '../mapped-types';
import { SiteDetails } from '../site';
import { wpcomRequest } from '../wpcom-request-controls';
import type { APIFetchOptions } from './types';
import type { SupportInteraction } from '@automattic/odie-client/src/types';

export const receiveHasSeenWhatsNewModal = ( value: boolean | undefined ) =>
	( {
		type: 'HELP_CENTER_SET_SEEN_WHATS_NEW_MODAL',
		value,
	} ) as const;

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

export function setCurrentSupportInteraction( supportInteraction: SupportInteraction ) {
	return {
		type: 'HELP_CENTER_SET_CURRENT_SUPPORT_INTERACTION',
		supportInteraction,
	} as const;
}

export const setNavigateToRoute = ( route?: string ) =>
	( {
		type: 'HELP_CENTER_SET_NAVIGATE_TO_ROUTE',
		route,
	} ) as const;

export const setUnreadCount = ( count: number ) =>
	( {
		type: 'HELP_CENTER_SET_UNREAD_COUNT',
		count,
	} ) as const;

export const setOdieInitialPromptText = ( text: string ) =>
	( {
		type: 'HELP_CENTER_SET_ODIE_INITIAL_PROMPT_TEXT',
		text,
	} ) as const;

export const setOdieBotNameSlug = ( odieBotNameSlug: string ) =>
	( {
		type: 'HELP_CENTER_SET_ODIE_BOT_NAME_SLUG',
		odieBotNameSlug,
	} ) as const;

export const setIsMinimized = ( minimized: boolean ) =>
	( {
		type: 'HELP_CENTER_SET_MINIMIZED',
		minimized,
	} ) as const;

export const setIsChatLoaded = ( isChatLoaded: boolean ) =>
	( {
		type: 'HELP_CENTER_SET_IS_CHAT_LOADED',
		isChatLoaded,
	} ) as const;

export const setZendeskClientId = ( zendeskClientId: string ) =>
	( {
		type: 'HELP_CENTER_SET_ZENDESK_CLIENT_ID',
		zendeskClientId,
	} ) as const;

export const setShowMessagingLauncher = ( show: boolean ) =>
	( {
		type: 'HELP_CENTER_SET_SHOW_MESSAGING_LAUNCHER',
		show,
	} ) as const;

export const setShowMessagingWidget = ( show: boolean ) =>
	( {
		type: 'HELP_CENTER_SET_SHOW_MESSAGING_WIDGET',
		show,
	} ) as const;

export const setShowHelpCenter = function* ( show: boolean ) {
	if ( ! show ) {
		yield setNavigateToRoute( undefined );
	} else {
		yield setShowMessagingWidget( false );
	}

	yield setIsMinimized( false );

	return {
		type: 'HELP_CENTER_SET_SHOW',
		show,
	} as const;
};

export const setSubject = ( subject: string ) =>
	( {
		type: 'HELP_CENTER_SET_SUBJECT',
		subject,
	} ) as const;

export const setMessage = ( message: string ) =>
	( {
		type: 'HELP_CENTER_SET_MESSAGE',
		message,
	} ) as const;

export const setUserDeclaredSiteUrl = ( url: string ) =>
	( {
		type: 'HELP_CENTER_SET_USER_DECLARED_SITE_URL',
		url,
	} ) as const;

export const setUserDeclaredSite = ( site: SiteDetails | undefined ) =>
	( {
		type: 'HELP_CENTER_SET_USER_DECLARED_SITE',
		site,
	} ) as const;

export const resetStore = () =>
	( {
		type: 'HELP_CENTER_RESET_STORE',
	} ) as const;

export const setShowMessagingChat = function* () {
	yield setShowHelpCenter( false );
	yield setShowMessagingLauncher( true );
	yield setShowMessagingWidget( true );
	yield resetStore();
};

export const setShowSupportDoc = function* ( link: string, postId?: number, blogId?: number ) {
	const params = new URLSearchParams( {
		link,
		...( postId && { postId: String( postId ) } ),
		...( blogId && { blogId: String( blogId ) } ), // Conditionally add blogId if it exists, the default is support blog
	} );

	yield setNavigateToRoute( `/post/?${ params }` );
	yield setShowHelpCenter( true );
	yield setIsMinimized( false );
};

export type HelpCenterAction =
	| ReturnType<
			| typeof setShowMessagingLauncher
			| typeof setShowMessagingWidget
			| typeof setSubject
			| typeof resetStore
			| typeof receiveHasSeenWhatsNewModal
			| typeof setMessage
			| typeof setUserDeclaredSite
			| typeof setUserDeclaredSiteUrl
			| typeof setUnreadCount
			| typeof setIsMinimized
			| typeof setIsChatLoaded
			| typeof setZendeskClientId
			| typeof setNavigateToRoute
			| typeof setOdieInitialPromptText
			| typeof setOdieBotNameSlug
			| typeof setCurrentSupportInteraction
	  >
	| GeneratorReturnType< typeof setShowHelpCenter | typeof setHasSeenWhatsNewModal >;
