/**
 * Hook for loading a conversation from server
 */

import { loadAllMessagesFromServer } from '@automattic/agenttic-client';
import { useCallback, useState } from '@wordpress/element';
import type { Message } from '@automattic/agenttic-client';

interface UseLoadConversationConfig {
	apiBaseUrl?: string;
	authProvider?: () => Promise< Record< string, string > >;
	onLoaded?: ( messages: Message[], sessionId: string ) => void;
}

interface UseLoadConversationResult {
	loadConversation: ( sessionId: string, botId: string ) => Promise< void >;
	isLoading: boolean;
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
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState< Error | null >( null );

	const loadConversation = useCallback(
		async ( sessionId: string, botId: string ) => {
			setIsLoading( true );
			setError( null );

			try {
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

				// Don't update cache here - let onLoaded handle it to avoid duplicate updates

				// Call onLoaded callback with messages and session ID from server
				if ( onLoaded ) {
					// Fallback to the sessionId we passed in if server doesn't return one
					const finalSessionId = result.sessionId || sessionId;
					await onLoaded( result.messages, finalSessionId );
				}
			} catch ( err ) {
				// eslint-disable-next-line no-console
				console.error( '[useLoadConversation] Error loading conversation:', err );
				setError( err as Error );
			} finally {
				setIsLoading( false );
			}
		},
		[ apiBaseUrl, authProvider, onLoaded ]
	);

	return {
		loadConversation,
		isLoading,
		error,
	};
}
