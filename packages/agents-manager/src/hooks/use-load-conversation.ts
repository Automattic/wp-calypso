/**
 * Hook for loading a conversation from server
 */

import { loadAllMessagesFromServer } from '@automattic/agenttic-client';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useRef } from '@wordpress/element';
import type { Message } from '@automattic/agenttic-client';

interface UseLoadConversationConfig {
	apiBaseUrl?: string;
	authProvider?: () => Promise< Record< string, string > >;
	onLoaded?: ( messages: Message[], sessionId: string ) => void;
}

interface LoadConversationParams {
	sessionId: string;
	botId: string;
}

interface UseLoadConversationResult {
	/** Triggers loading a conversation from the server. */
	loadConversation: ( sessionId: string, botId: string ) => void;
	/** Whether a conversation is currently being loaded. */
	isLoading: boolean;
	/** The error from the last load attempt, or null if successful. */
	error: Error | null;
}

/**
 * Hook to load a full conversation from the server by session_id (UUID)
 * @param config
 */
export default function useLoadConversation(
	config: UseLoadConversationConfig
): UseLoadConversationResult {
	const { apiBaseUrl, authProvider, onLoaded } = config;

	// Use ref to always have access to the latest onLoaded callback
	const onLoadedRef = useRef( onLoaded );
	onLoadedRef.current = onLoaded;

	const mutation = useMutation( {
		mutationFn: async ( { sessionId, botId }: LoadConversationParams ) => {
			// Load all messages from the conversation by session_id
			// Note: tool_call and tool_result messages are filtered out in serverChatToLoadResult
			const result = await loadAllMessagesFromServer(
				sessionId,
				{
					botId,
					apiBaseUrl,
					authProvider,
				},
				10 // max 10 pages
			);

			return { result, sessionId };
		},
		onSuccess: ( { result, sessionId } ) => {
			// Call onLoaded callback with messages and session ID from server
			// Fallback to the sessionId we passed in if server doesn't return one
			onLoadedRef.current?.( result.messages, result.sessionId || sessionId );
		},
		onError: ( error ) => {
			// eslint-disable-next-line no-console
			console.error( '[useLoadConversation] Error loading conversation:', error );
		},
	} );

	const loadConversation = useCallback(
		( sessionId: string, botId: string ) => mutation.mutate( { sessionId, botId } ),
		[ mutation ]
	);

	return {
		loadConversation,
		isLoading: mutation.isPending,
		error: mutation.error,
	};
}
