import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { AGENTS_MANAGER_STORE } from '../stores';
import { getAgentsManagerInlineData } from '../utils/get-agents-manager-inline-data';
import { recordBigSkyTracksEvent } from '../utils/tracks';
import { usesLocalStatePersistence } from '../utils/uses-local-state-persistence';
import type { AgentsManagerSelect } from '@automattic/data-stores';

const OPEN_CHAT_URL_PARAM = 'ai-open';

const hasOpenChatUrlParam = () =>
	typeof window !== 'undefined' &&
	new URLSearchParams( window.location.search ).get( OPEN_CHAT_URL_PARAM ) === 'true';

/**
 * Opens the chat when the page URL carries `?ai-open=true` (e.g. promo links
 * from emails), then strips the param so reloads don't re-open it. The param
 * is captured on the first render since hosts like the Site Editor rewrite
 * the URL during boot. Returns `true` once handled — `AgentsManager` gates
 * rendering on it so the chat first-renders already open; without the param
 * it returns `true` immediately.
 */
export function useOpenChatUrlParam(): boolean {
	const [ isHandled, setIsHandled ] = useState( () => ! hasOpenChatUrlParam() );
	const hasOpenedRef = useRef( false );
	const { setIsOpen, setIsMinimized } = useDispatch( AGENTS_MANAGER_STORE );
	const { hasLoaded, isOpen, isMinimized, isChatVisible } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	useEffect( () => {
		if ( isHandled || ! hasLoaded ) {
			return;
		}

		if ( ! hasOpenedRef.current ) {
			hasOpenedRef.current = true;

			// Client-persisted hosts (reader chat, the anonymous storefront) run on
			// public frontends: Big Sky parity events don't apply, and open state
			// must not persist to the logged-in REST endpoint.
			const persistsLocally = usesLocalStatePersistence( getAgentsManagerInlineData()?.agentId );

			if ( ! persistsLocally ) {
				recordBigSkyTracksEvent( 'jetpack_big_sky_ai_editor_menu_opened' );
			}

			if ( ! isOpen ) {
				setIsOpen( true, ! persistsLocally );
			}

			if ( isMinimized ) {
				setIsMinimized( false, ! persistsLocally );
			}

			const url = new URL( window.location.href );
			if ( url.searchParams.has( OPEN_CHAT_URL_PARAM ) ) {
				url.searchParams.delete( OPEN_CHAT_URL_PARAM );
				window.history.replaceState( window.history.state, '', url );
			}
		}

		// Handled only once the store shows the chat, which the dispatches above
		// bring about by re-running this effect.
		if ( isChatVisible ) {
			setIsHandled( true );
		}
	}, [ hasLoaded, isChatVisible, isHandled, isMinimized, isOpen, setIsMinimized, setIsOpen ] );

	return isHandled;
}
