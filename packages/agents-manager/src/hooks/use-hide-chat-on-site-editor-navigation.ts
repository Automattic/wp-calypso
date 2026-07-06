import { useLayoutEffect, useSyncExternalStore } from '@wordpress/element';
import { isSiteEditorContext, isSiteEditorCanvasEditMode } from '../utils/site-editor-context';
import { ADMIN_BAR_BUTTON_ID, ADMIN_BAR_AI_CHAT_BUTTON_ID } from './use-admin-bar-integration';
import { SIDEBAR_CONTAINER_CLASS, SIDEBAR_OPEN_CLASS } from './use-agent-layout-manager';

const LOCATION_CHANGE_EVENT = 'agentsManagerLocationChange';

// The two top-level entry points; hiding them also hides the Help dropdown's children.
const ADMIN_BAR_ENTRY_SELECTOR = `#${ ADMIN_BAR_BUTTON_ID }, #${ ADMIN_BAR_AI_CHAT_BUTTON_ID }`;

// Docked-sidebar body classes that reserve layout space, set by the layout manager.
const SIDEBAR_BODY_CLASSES = [ SIDEBAR_CONTAINER_CLASS, SIDEBAR_OPEN_CLASS ];

// `pushState`/`replaceState` fire no event, so Site Editor navigation is invisible.
// Patch them once to also dispatch `LOCATION_CHANGE_EVENT`; never restored, to
// avoid clobbering another library's patch.
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

function subscribeToLocation( notify: () => void ): () => void {
	// Off the Site Editor this value can't change, so skip the listeners and the
	// history patch entirely.
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

function getIsSiteEditorNavigation(): boolean {
	return isSiteEditorContext() && ! isSiteEditorCanvasEditMode();
}

/**
 * True on the Site Editor navigation view (`site-editor.php` without
 * `?canvas=edit`) — the one with the left nav menu, where the chat can't work.
 * False in the editing canvas and on all other pages. Reacts to the Site Editor's
 * client-side navigation.
 */
export function useIsSiteEditorNavigation(): boolean {
	return useSyncExternalStore( subscribeToLocation, getIsSiteEditorNavigation );
}

/**
 * Hides the chat's surfaces on the Site Editor navigation view (where it can't
 * work) and restores them in the editing canvas, without touching the docked
 * state. It hides two things:
 * - the server-rendered admin-bar entry points (the AI chat button and the Help
 *   menu, whose items also open the chat), via an inline `!important`;
 * - the docked sidebar's reserved space, by stripping the layout manager's body
 *   classes and adding them back.
 *
 * Returns whether we're on the navigation view, so the dock can skip its work
 * there — render nothing and keep its layout manager idle.
 */
export default function useHideChatOnSiteEditorNavigation(): boolean {
	const isSiteEditorNavigation = useIsSiteEditorNavigation();

	useLayoutEffect( () => {
		if ( ! isSiteEditorNavigation ) {
			return;
		}

		const buttons = document.querySelectorAll< HTMLElement >( ADMIN_BAR_ENTRY_SELECTOR );
		buttons.forEach( ( button ) => button.style.setProperty( 'display', 'none', 'important' ) );

		return () => {
			buttons.forEach( ( button ) => button.style.removeProperty( 'display' ) );
		};
	}, [ isSiteEditorNavigation ] );

	useLayoutEffect( () => {
		if ( ! isSiteEditorNavigation ) {
			return;
		}

		// `agent-dock` keeps the layout manager idle here, so nothing re-adds these classes.
		const { classList } = document.body;
		const removed = SIDEBAR_BODY_CLASSES.filter( ( cls ) => classList.contains( cls ) );
		removed.forEach( ( cls ) => classList.remove( cls ) );

		return () => removed.forEach( ( cls ) => classList.add( cls ) );
	}, [ isSiteEditorNavigation ] );

	return isSiteEditorNavigation;
}
