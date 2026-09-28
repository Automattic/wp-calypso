import { isTestModeEnvironment } from '@automattic/zendesk-client';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { useOdieAssistantContext } from '../context';
import { useCurrentSupportInteraction } from '../data/use-current-support-interaction';
import { getSupportInteractionQueryKey } from '../data/use-get-support-interaction-by-id';
import { useLoggedOutSession } from './use-logged-out-session';

/**
 * A refresh runs at most this often: focus and visibility changes usually fire together.
 */
const REFRESH_THROTTLE_MS = 5000;

/**
 * Every tab keeps its own copy of the chat, so a message sent or an escalation made in
 * another tab only shows up here after a refetch. Do one when the user comes back to
 * this tab: drop the cached interaction and Odie chat, then put the chat in its loading
 * state so `useGetCombinedChat` rebuilds it from fresh data, and re-downloads a Zendesk
 * conversation, the same way it does on open, on reconnect and on a Smooch re-init.
 */
export const useRefreshChatOnFocus = () => {
	const { chat, setChat } = useOdieAssistantContext();
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();
	const { loggedOutOdieChatId } = useLoggedOutSession();
	const queryClient = useQueryClient();
	const lastRefreshRef = useRef( 0 );

	const chatStatus = chat.status;
	const supportInteractionId = currentSupportInteraction?.uuid;
	const hasChat = !! supportInteractionId || !! loggedOutOdieChatId;

	const refreshChat = useCallback( async () => {
		// Nothing to refetch for a chat that has not been created yet, and never
		// interrupt a send, a transfer or a load already in progress.
		if ( chatStatus !== 'loaded' || ! hasChat ) {
			return;
		}

		const now = Date.now();
		if ( now - lastRefreshRef.current < REFRESH_THROTTLE_MS ) {
			return;
		}
		lastRefreshRef.current = now;

		// The interaction decides whether the chat is still with Odie or moved to
		// Zendesk in the meantime, so wait for the fresh one before the rebuild
		// starts. Otherwise a quick Odie refetch could settle the chat on the stale
		// interaction first.
		if ( supportInteractionId ) {
			await queryClient.invalidateQueries( {
				queryKey: getSupportInteractionQueryKey( supportInteractionId, isTestModeEnvironment() ),
			} );
		}
		queryClient.invalidateQueries( { queryKey: [ 'odie-chat' ] } );

		// Re-checked here: the user may have started a send while the interaction loaded.
		setChat( ( prevChat ) =>
			prevChat.status === 'loaded' ? { ...prevChat, status: 'loading' } : prevChat
		);
	}, [ chatStatus, hasChat, supportInteractionId, queryClient, setChat ] );

	useEffect( () => {
		const onVisibilityChange = () => {
			if ( document.visibilityState === 'visible' ) {
				refreshChat();
			}
		};

		document.addEventListener( 'visibilitychange', onVisibilityChange );
		window.addEventListener( 'focus', refreshChat );

		return () => {
			document.removeEventListener( 'visibilitychange', onVisibilityChange );
			window.removeEventListener( 'focus', refreshChat );
		};
	}, [ refreshChat ] );
};
