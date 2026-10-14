import { useEffect, useSyncExternalStore } from '@wordpress/element';
import { getChatPresentation } from '../utils/chat-presentation';
import { isAdminBarInEditor, isEditorAiEntryEnabled } from '../utils/editor-entry-points';
import { isSiteEditorContext, isSiteEditorNavigationView } from '../utils/site-editor-context';

// The standalone AI chat button — the chat's entry point, separate from the Help
// menu. wp-admin renders it server-side, so it's found by ID.
export const ADMIN_BAR_AI_CHAT_BUTTON_ID = 'wp-admin-bar-agents-manager-ai-chat';

const ENTRY_BUTTON_CHANGE_EVENT = 'agentsManagerEntryButtonChange';

function dispatchEntryButtonChange(): void {
	window.dispatchEvent( new Event( ENTRY_BUTTON_CHANGE_EVENT ) );
}

let registeredMasterbarAiChatButtonCount = 0;

/**
 * Registers the Calypso masterbar's AI chat button while `hasAiChatButton` is true.
 * The masterbar renders the button only after its admin-bar nodes load, often after
 * the chat mounts, so it registers the button up front instead of the chat looking
 * for it in the DOM.
 */
export function useRegisterMasterbarAiChatButton( hasAiChatButton: boolean ): void {
	useEffect( () => {
		if ( ! hasAiChatButton ) {
			return;
		}

		registeredMasterbarAiChatButtonCount++;
		dispatchEntryButtonChange();

		return () => {
			registeredMasterbarAiChatButtonCount--;
			dispatchEntryButtonChange();
		};
	}, [ hasAiChatButton ] );
}

/**
 * Whether an AI chat entry button (wp-admin bar, Calypso masterbar, or editor toolbar) is
 * present. If so, the chat hides on close and reopens from it instead of a floating bubble.
 */
export function hasAiChatEntryButton(): boolean {
	if ( ! getChatPresentation().showEntryPoints ) {
		return false;
	}
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
		registeredMasterbarAiChatButtonCount > 0
	);
}

// `pushState`/`replaceState` fire no event, so Site Editor navigation would
// otherwise go unnoticed. Patch them once to also dispatch
// `ENTRY_BUTTON_CHANGE_EVENT`; never restored, to avoid clobbering another
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
			dispatchEntryButtonChange();
			return result;
		};
	} );
}

function subscribeToEntryButtonChange( notify: () => void ): () => void {
	window.addEventListener( ENTRY_BUTTON_CHANGE_EVENT, notify );
	if ( isSiteEditorContext() ) {
		patchHistoryOnce();
		window.addEventListener( 'popstate', notify );
	}

	return () => {
		window.removeEventListener( ENTRY_BUTTON_CHANGE_EVENT, notify );
		window.removeEventListener( 'popstate', notify );
	};
}

/**
 * Reactive `hasAiChatEntryButton()` — re-evaluates on the Site Editor's client-side
 * navigation and the masterbar button's registration.
 */
export default function useHasAiChatEntryButton(): boolean {
	return useSyncExternalStore( subscribeToEntryButtonChange, hasAiChatEntryButton );
}
