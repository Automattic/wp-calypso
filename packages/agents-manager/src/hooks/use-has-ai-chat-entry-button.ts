import { useSyncExternalStore } from '@wordpress/element';
import { isAdminBarInEditor, isEditorAiEntryEnabled } from '../utils/editor-entry-points';
import { isSiteEditorContext, isSiteEditorNavigationView } from '../utils/site-editor-context';

// The standalone AI chat button — the chat's entry point, separate from the Help
// menu. The wp-admin bar exposes it by ID; Calypso's masterbar by class.
export const ADMIN_BAR_AI_CHAT_BUTTON_ID = 'wp-admin-bar-agents-manager-ai-chat';
const MASTERBAR_AI_CHAT_BUTTON_SELECTOR = '.masterbar__item-agents-manager-ai-chat';

/**
 * Whether an AI chat entry button (wp-admin bar, Calypso masterbar, or editor toolbar) is
 * present. If so, the chat hides on close and reopens from it instead of a floating bubble.
 */
export function hasAiChatEntryButton(): boolean {
	// The Site Editor navigation view hides the editor toolbar and — unless the
	// omnibar experiment shows it — the admin bar, whose markup can still sit
	// hidden in the DOM. Only the omnibar's admin-bar button counts as an entry.
	// (`isEditorAiEntryEnabled()` stays `true` here on purpose: it keeps the
	// toolbar `Fill` registered for the canvas.)
	if ( isSiteEditorNavigationView() ) {
		return isAdminBarInEditor() && !! document.getElementById( ADMIN_BAR_AI_CHAT_BUTTON_ID );
	}

	return (
		isEditorAiEntryEnabled() ||
		!! document.getElementById( ADMIN_BAR_AI_CHAT_BUTTON_ID ) ||
		!! document.querySelector( MASTERBAR_AI_CHAT_BUTTON_SELECTOR )
	);
}

const LOCATION_CHANGE_EVENT = 'agentsManagerLocationChange';

// `pushState`/`replaceState` fire no event, so Site Editor navigation would
// otherwise go unnoticed. Patch them once to also dispatch
// `LOCATION_CHANGE_EVENT`; never restored, to avoid clobbering another
// library's patch.
let historyPatched = false;
function patchHistoryOnce(): void {
	if ( historyPatched ) {
		return;
	}
	historyPatched = true;

	( [ 'pushState', 'replaceState' ] as const ).forEach( ( method ) => {
		const original = window.history[ method ];
		window.history[ method ] = function ( ...args ) {
			const result = original.apply( this, args );
			window.dispatchEvent( new Event( LOCATION_CHANGE_EVENT ) );
			return result;
		};
	} );
}

/**
 * Subscribes `notify` to the Site Editor's client-side navigation (`pushState`,
 * `replaceState`, and `popstate`). No-op off the Site Editor — the only surface
 * where an entry button appears or disappears without a full page load.
 */
function subscribeToSiteEditorLocation( notify: () => void ): () => void {
	if ( ! isSiteEditorContext() ) {
		return () => {};
	}

	patchHistoryOnce();
	window.addEventListener( 'popstate', notify );
	window.addEventListener( LOCATION_CHANGE_EVENT, notify );

	return () => {
		window.removeEventListener( 'popstate', notify );
		window.removeEventListener( LOCATION_CHANGE_EVENT, notify );
	};
}

/**
 * Reactive `hasAiChatEntryButton()` — re-evaluates on the Site Editor's client-side
 * navigation, where the toolbar entry appears and disappears without a page load.
 */
export default function useHasAiChatEntryButton(): boolean {
	return useSyncExternalStore( subscribeToSiteEditorLocation, hasAiChatEntryButton );
}
