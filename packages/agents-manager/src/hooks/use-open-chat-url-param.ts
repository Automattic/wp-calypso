import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { AGENTS_MANAGER_STORE } from '../stores';
import { isReaderChatHost } from '../utils/is-reader-chat-agent';
import { recordBigSkyTracksEvent } from '../utils/tracks';
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
	const { hasLoaded, isOpen, isMinimized } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	useEffect( () => {
		if ( isHandled || ! hasLoaded ) {
			return;
		}

		if ( ! hasOpenedRef.current ) {
			hasOpenedRef.current = true;

			// Reader chat runs on public blog frontends: Big Sky parity events
			// don't apply there, and open state must not persist to the
			// logged-in REST endpoint.
			const isReaderChat = isReaderChatHost();

			if ( ! isReaderChat ) {
				recordBigSkyTracksEvent( 'ai_editor_menu_opened' );
			}

			if ( ! isOpen ) {
				setIsOpen( true, ! isReaderChat );
			}

			if ( isMinimized ) {
				setIsMinimized( false, ! isReaderChat );
			}

			const url = new URL( window.location.href );
			if ( url.searchParams.has( OPEN_CHAT_URL_PARAM ) ) {
				url.searchParams.delete( OPEN_CHAT_URL_PARAM );
				window.history.replaceState( window.history.state, '', url );
			}
		}

		// Handled only once the store reflects the open state; the dispatches
		// above re-run this effect via the `isOpen`/`isMinimized` deps.
		if ( isOpen && ! isMinimized ) {
			setIsHandled( true );
		}
	}, [ hasLoaded, isHandled, isMinimized, isOpen, setIsMinimized, setIsOpen ] );

	return isHandled;
}
