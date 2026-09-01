import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { AGENTS_MANAGER_STORE } from '../stores';
import { DEFAULT_DESKTOP_MEDIA_QUERY } from './desktop-media-query';
import { hasOpenChatUrlParam } from './use-open-chat-url-param';
import type { AgentsManagerSelect } from '@automattic/data-stores';

/** Whether the viewport is below the desktop breakpoint the dock uses. */
function isSmallViewport(): boolean {
	if ( typeof window === 'undefined' || ! window.matchMedia ) {
		return false;
	}
	const query = window.__agentsManagerActions?.desktopMediaQuery ?? DEFAULT_DESKTOP_MEDIA_QUERY;
	return ! window.matchMedia( query ).matches;
}

/**
 * Starts the chat closed on small viewports, where the floating chat covers
 * the whole screen: a user landing on a phone with `agents_manager_open`
 * persisted from an earlier (usually desktop) session would see only the
 * chat, not the page they navigated to. Closed still leaves the chat one tap
 * away — the admin-bar entry or the floating button reopens it.
 *
 * Deliberately narrow:
 *
 * - Applies once, to the persisted state the session starts from. Anything
 *   the user does afterwards (opening, closing, rotating) is theirs.
 * - `?ai-open=true` wins: an explicit ask to open is not a stale preference.
 *   Both this hook and `useOpenChatUrlParam` capture the param on the first
 *   render, before it is consumed.
 * - The close is not persisted, so a later desktop session still restores
 *   the chat the way the user left it.
 *
 * Returns `true` once handled. `AgentsManager` gates rendering on it so the
 * chat never first-paints open on a small viewport; without anything to do it
 * returns `true` immediately.
 */
export function useSmallViewportDefaultClosed(): boolean {
	const [ shouldApply ] = useState( () => isSmallViewport() && ! hasOpenChatUrlParam() );
	const [ isHandled, setIsHandled ] = useState( false );
	const { setIsOpen } = useDispatch( AGENTS_MANAGER_STORE );
	const { hasLoaded, isOpen } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	useEffect( () => {
		if ( ! shouldApply || isHandled || ! hasLoaded ) {
			return;
		}

		if ( isOpen ) {
			// Close without saving; the effect re-runs via the `isOpen` dep
			// and reports handled once the store reflects the closed state.
			setIsOpen( false, false );
			return;
		}

		setIsHandled( true );
	}, [ hasLoaded, isHandled, isOpen, setIsOpen, shouldApply ] );

	return isHandled || ! shouldApply;
}
