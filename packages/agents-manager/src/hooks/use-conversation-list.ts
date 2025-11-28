/**
 * Hook for fetching and managing conversation list
 */

import {
	listConversationsFromServer,
	type ServerConversationListItem,
} from '@automattic/agenttic-client';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { conversationListCache } from '../utils/conversation-cache';
import { parseMySQLDateTime } from '../utils/formatters';

interface UseConversationListResult {
	conversations: ServerConversationListItem[];
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise< void >;
}

interface UseConversationListConfig {
	botId: string;
	apiBaseUrl?: string;
	authProvider?: () => Promise< Record< string, string > >;
	enabled?: boolean;
}

/**
 * Hook to fetch and manage conversation list from server
 * @param config
 */
export default function useConversationList(
	config: UseConversationListConfig
): UseConversationListResult {
	const { botId, apiBaseUrl, authProvider, enabled = true } = config;

	// Try to load from cache immediately
	const cachedConversations = conversationListCache.get( botId );
	const [ conversations, setConversations ] = useState< ServerConversationListItem[] >(
		cachedConversations || []
	);
	const [ isLoading, setIsLoading ] = useState( ! cachedConversations );
	const [ error, setError ] = useState< Error | null >( null );

	const fetchConversations = useCallback( async () => {
		if ( ! enabled ) {
			return;
		}

		setIsLoading( true );
		setError( null );

		try {
			const result = await listConversationsFromServer( botId, {
				apiBaseUrl,
				authProvider,
			} );

			// Sort by created_at descending (most recent first)
			// Note: Dates are in MySQL format "2025-11-06 14:29:49"
			const sorted = result.sort( ( a, b ) => {
				const timeA = parseMySQLDateTime( a.created_at ).getTime();
				const timeB = parseMySQLDateTime( b.created_at ).getTime();
				return timeB - timeA;
			} );

			// Update cache with fresh data
			conversationListCache.set( botId, sorted );
			setConversations( sorted );
		} catch ( err ) {
			setError( err as Error );
			setConversations( [] );
		} finally {
			setIsLoading( false );
		}
	}, [ botId, apiBaseUrl, authProvider, enabled ] );

	// Auto-fetch on mount and when config changes
	useEffect( () => {
		fetchConversations().catch( ( err ) => {
			// eslint-disable-next-line no-console
			console.error( 'Failed to fetch conversations:', err );
		} );
	}, [ fetchConversations ] );

	return {
		conversations,
		isLoading,
		error,
		refetch: fetchConversations,
	};
}
