import { isTestModeEnvironment } from '@automattic/zendesk-client';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { useOdieAssistantContext } from '../context';
import { useCurrentSupportInteraction } from '../data/use-current-support-interaction';
import { getSupportInteractionQueryKey } from '../data/use-get-support-interaction-by-id';
import { getConversationIdFromInteraction } from '../utils/support-interaction-utils';
import { useLoggedOutSession } from './use-logged-out-session';
import type { SupportInteraction } from '../types';

/**
 * A refresh runs at most this often: focus and visibility changes usually fire together.
 */
const REFRESH_THROTTLE_MS = 5000;

/**
 * Every tab keeps its own copy of the chat, so a message sent or an escalation made in
 * another tab only shows up here after a refetch. Do one when the user comes back to
 * this tab: drop the cached interaction and Odie chat, then have `useGetCombinedChat`
 * rebuild the chat from fresh data, and re-download a Zendesk conversation, in the
 * background. The chat stays on show and usable meanwhile. Only a chat that another tab
 * moved to a human loads again with the loader, the same way it does on open.
 */
export const useRefreshChatOnFocus = () => {
	const { chat, setChat, refreshChatInBackground } = useOdieAssistantContext();
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();
	const { loggedOutOdieChatId } = useLoggedOutSession();
	const queryClient = useQueryClient();
	const lastRefreshRef = useRef( 0 );

	const chatStatus = chat.status;
	const hasHumanChat = !! chat.conversationId;
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
		let isMovedToHuman = false;
		if ( supportInteractionId ) {
			const queryKey = getSupportInteractionQueryKey(
				supportInteractionId,
				isTestModeEnvironment()
			);
			await queryClient.invalidateQueries( { queryKey } );
			isMovedToHuman =
				! hasHumanChat &&
				!! getConversationIdFromInteraction(
					queryClient.getQueryData< SupportInteraction >( queryKey )
				);
		}
		queryClient.invalidateQueries( { queryKey: [ 'odie-chat' ] } );

		if ( isMovedToHuman ) {
			// Load the human chat with the loader, so nothing goes to the AI while it loads.
			// Re-checked here: the user may have started a send while the interaction loaded.
			setChat( ( prevChat ) =>
				prevChat.status === 'loaded' && ! prevChat.conversationId
					? { ...prevChat, status: 'loading' }
					: prevChat
			);
			return;
		}

		refreshChatInBackground();
	}, [
		chatStatus,
		hasChat,
		hasHumanChat,
		supportInteractionId,
		queryClient,
		setChat,
		refreshChatInBackground,
	] );

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
