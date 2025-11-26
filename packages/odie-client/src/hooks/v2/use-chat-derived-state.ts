import { useMemo } from 'react';
import type { ChatStatus, SupportProvider } from '../../types';

interface UseChatDerivedStateParams {
	// Source data
	conversationId: string | null;
	odieId: number | null;
	wpcomUserId: number | null;

	// Loading flags
	isOdieLoading: boolean;
	isZendeskLoading: boolean;
	isRefreshingAfterReconnect: boolean;

	// Status flags
	isSending: boolean;
	isTransferring: boolean;

	// Interaction data
	interactionStatus?: 'open' | 'closed' | 'resolved' | 'solved';

	// Connection status
	connectionStatus?: 'connected' | 'disconnected' | 'reconnecting';
}

interface ChatDerivedState {
	provider: SupportProvider;
	status: ChatStatus;
	odieId: number | null;
	conversationId: string | null;
	wpcomUserId: number | null;
}

/**
 * Derives chat state from source data.
 * No state is stored - everything is computed.
 */
export const useChatDerivedState = ( params: UseChatDerivedStateParams ): ChatDerivedState => {
	const {
		conversationId,
		odieId,
		wpcomUserId,
		isOdieLoading,
		isZendeskLoading,
		isRefreshingAfterReconnect,
		isSending,
		isTransferring,
		interactionStatus,
	} = params;

	console.log( 'params', params );
	// Derive provider from conversationId
	const provider = useMemo< SupportProvider >( () => {
		return conversationId ? 'zendesk' : 'odie';
	}, [ conversationId ] );

	// Derive status from loading/sending flags
	// Priority order matters here
	const status = useMemo< ChatStatus >( () => {
		// 1. Check if transferring (highest priority)
		if ( isTransferring ) {
			return 'transfer';
		}

		// 2. Check if sending message
		if ( isSending ) {
			return 'sending';
		}

		// 3. Check if loading data
		if (
			isOdieLoading ||
			isZendeskLoading ||
			// isUploadingUnsentMessages ||
			isRefreshingAfterReconnect
		) {
			return 'loading';
		}

		// 4. Check if interaction is closed
		if ( interactionStatus === 'closed' ) {
			return 'closed';
		}

		// 5. Default to loaded
		return 'loaded';
	}, [
		isTransferring,
		isSending,
		isOdieLoading,
		isZendeskLoading,
		isRefreshingAfterReconnect,
		interactionStatus,
	] );

	return {
		provider,
		status,
		odieId,
		conversationId,
		wpcomUserId,
	};
};
