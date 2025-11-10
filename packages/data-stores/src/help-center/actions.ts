import { default as apiFetch } from '@wordpress/api-fetch';
import { select } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { default as wpcomRequestPromise, canAccessWpcomApis } from 'wpcom-proxy-request';
import { GeneratorReturnType } from '../mapped-types';
import { SiteDetails } from '../site';
import { wpcomRequest } from '../wpcom-request-controls';
import { STORE_KEY } from './constants';
import { isE2ETest } from '.';
import type {
	APIFetchOptions,
	HelpCenterOptions,
	HelpCenterSelect,
	HelpCenterShowOptions,
} from './types';
import type { Location } from 'history';

/**
 * Save the open state of the help center to the remote user preferences.
 * @param isShown - Whether the help center is shown.
 * @param isMinimized - Whether the help center is minimized.
 */
export const saveOpenState = ( isShown: boolean | undefined, isMinimized: boolean | undefined ) => {
	const saveState: Record< string, boolean | null > = {};

	if ( typeof isShown === 'boolean' ) {
		saveState.help_center_open = isShown;
		if ( ! isShown ) {
			// Delete the remote version of the navigation history when closing the help center
			saveState.help_center_router_history = null;
		}
	}

	if ( typeof isMinimized === 'boolean' ) {
		saveState.help_center_minimized = isMinimized;
	}

	if ( canAccessWpcomApis() ) {
		// Use the promise version to do that action without waiting for the result.
		wpcomRequestPromise( {
			path: '/me/preferences',
			apiNamespace: 'wpcom/v2',
			method: 'PUT',
			body: { calypso_preferences: saveState },
		} ).catch( () => {} );
	} else {
		// Use the promise version to do that action without waiting for the result.
		apiFetch( {
			global: true,
			path: '/help-center/open-state',
			method: 'PUT',
			data: saveState,
		} as APIFetchOptions ).catch( () => {} );
	}
};

export function setHelpCenterRouterHistory(
	history: { entries: Location[]; index: number } | undefined
) {
	return {
		type: 'HELP_CENTER_SET_HELP_CENTER_ROUTER_HISTORY',
		history,
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

export const setIsMinimized = function* ( minimized: boolean ) {
	yield saveOpenState( undefined, minimized );
	return {
		type: 'HELP_CENTER_SET_MINIMIZED',
		minimized,
	} as const;
};

export const setIsChatLoaded = ( isChatLoaded: boolean ) =>
	( {
		type: 'HELP_CENTER_SET_IS_CHAT_LOADED',
		isChatLoaded,
	} ) as const;

export const setAreSoundNotificationsEnabled = ( areSoundNotificationsEnabled: boolean ) =>
	( {
		type: 'HELP_CENTER_SET_ARE_SOUND_NOTIFICATIONS_ENABLED',
		areSoundNotificationsEnabled,
	} ) as const;

export const setZendeskClientId = ( zendeskClientId: string ) =>
	( {
		type: 'HELP_CENTER_SET_ZENDESK_CLIENT_ID',
		zendeskClientId,
	} ) as const;

export const setZendeskConnectionStatus = (
	connectionStatus: 'disconnected' | 'reconnecting' | 'connected'
) =>
	( {
		type: 'HELP_CENTER_SET_ZENDESK_CONNECTION_STATUS',
		connectionStatus,
	} ) as const;

export const setSupportTypingStatus = ( conversationId: string, isTyping: false ) =>
	( {
		type: 'HELP_CENTER_SET_TYPING_STATUS',
		conversationId,
		isTyping,
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

export const setMessage = ( message: string ) =>
	( {
		type: 'HELP_CENTER_SET_MESSAGE',
		message,
	} ) as const;

export const setContextTerm = ( contextTerm: string ) =>
	( {
		type: 'HELP_CENTER_SET_CONTEXT_TERM',
		contextTerm,
	} ) as const;

export const setHasPremiumSupport = ( allow: boolean ) =>
	( {
		type: 'HELP_CENTER_SET_HAS_PREMIUM_SUPPORT',
		allow,
	} ) as const;

export const setHelpCenterOptions = ( options: HelpCenterOptions ) => ( {
	type: 'HELP_CENTER_SET_OPTIONS' as const,
	options,
} );

export const setIsShow = ( show: boolean ) => ( {
	type: 'HELP_CENTER_SET_SHOW' as const,
	show,
} );

export const setShowHelpCenter = function* (
	show: boolean,
	options: HelpCenterShowOptions = {
		hasPremiumSupport: false,
		hideBackButton: false,
		contextTerm: '',
	},
	/**
	 * When the Help Center is minimized and someone clicks the (?) toggle button, we should maximize it.
	 * But this means ignoring the `show=false` value the button will send. The problem is we'll also ignore the `show=false` when the close (x) buttons is clicked too.
	 * `forceClose` listens to the show value always. Which the (x) button sets to true.
	 */
	forceClose = false
): Generator< unknown, ReturnType< typeof setIsShow >, unknown > {
	let isMinimized = ( select( STORE_KEY ) as HelpCenterSelect ).getIsMinimized();

	// Opening or closing the Help Center should reset the minimized state.
	if ( ! show && ! forceClose && isMinimized ) {
		yield setIsMinimized( false );
		isMinimized = false;

		return setIsShow( true );
	}

	if ( ! isE2ETest() ) {
		saveOpenState( show, isMinimized );
	}

	if ( ! show ) {
		yield setNavigateToRoute( undefined );
		// Reset the local navigation history when closing the help center.
		yield setHelpCenterRouterHistory( undefined );
	} else {
		yield setShowMessagingWidget( false );
	}

	yield setContextTerm( options?.contextTerm || '' );
	yield setIsMinimized( false );

	if ( options?.hasPremiumSupport ) {
		yield setHasPremiumSupport( true );
	}

	if ( options ) {
		yield setHelpCenterOptions( options );
	}

	return setIsShow( show );
};

export const setSubject = ( subject: string ) =>
	( {
		type: 'HELP_CENTER_SET_SUBJECT',
		subject,
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

export const setNewMessagingChat = function* ( {
	initialMessage,
	section,
	siteUrl,
	siteId,
	userFieldFlowName,
}: {
	initialMessage: string;
	section?: string;
	siteUrl?: string;
	siteId?: string;
	userFieldFlowName?: string;
} ) {
	const url = addQueryArgs( '/odie', {
		provider: 'zendesk',
		userFieldMessage: initialMessage,
		section,
		siteUrl,
		siteId,
		userFieldFlowName,
	} );
	yield setNavigateToRoute( url );
	yield setShowHelpCenter( true );
};

export const setNavigateToOdie = function* () {
	yield setNavigateToRoute( '/odie' );
	yield setShowHelpCenter( true );
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

export const loadHelpCenterPreference = function* (): Generator<
	unknown,
	{ type: 'HELP_CENTER_LOAD_PREFERENCE_DONE' },
	unknown
> {
	try {
		const response = canAccessWpcomApis()
			? yield wpcomRequest( {
					path: '/me/preferences?s=1',
					apiNamespace: 'wpcom/v2',
			  } )
			: yield apiFetch( {
					global: true,
					path: '/help-center/open-state',
			  } as APIFetchOptions );

		const { calypso_preferences: preferences } = response as {
			calypso_preferences: {
				help_center_open: boolean;
				help_center_minimized: boolean;
				help_center_router_history: {
					entries: Location[];
					index: number;
				};
			};
		};

		if ( preferences.help_center_router_history ) {
			yield setHelpCenterRouterHistory( preferences.help_center_router_history );
		}

		yield setIsMinimized( preferences.help_center_minimized );

		// We only want to auto-open, we don't want to auto-close (and potentially overrule the user's action).
		if ( preferences.help_center_open ) {
			yield setIsShow( true );
		}
	} catch {}

	return {
		type: 'HELP_CENTER_LOAD_PREFERENCE_DONE',
	};
};

export type HelpCenterAction =
	| ReturnType<
			| typeof setShowMessagingLauncher
			| typeof setShowMessagingWidget
			| typeof setSubject
			| typeof resetStore
			| typeof setMessage
			| typeof setContextTerm
			| typeof setUserDeclaredSite
			| typeof setUserDeclaredSiteUrl
			| typeof setUnreadCount
			| typeof setHelpCenterRouterHistory
			| typeof setIsChatLoaded
			| typeof setAreSoundNotificationsEnabled
			| typeof setZendeskClientId
			| typeof setSupportTypingStatus
			| typeof setZendeskConnectionStatus
			| typeof setNavigateToRoute
			| typeof setOdieInitialPromptText
			| typeof setOdieBotNameSlug
			| typeof setHasPremiumSupport
			| typeof setHelpCenterOptions
	  >
	| GeneratorReturnType< typeof setShowHelpCenter >
	| GeneratorReturnType< typeof setIsMinimized >
	| GeneratorReturnType< typeof loadHelpCenterPreference >;
