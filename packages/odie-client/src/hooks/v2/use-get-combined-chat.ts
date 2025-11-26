import { useMemo, useCallback, useEffect } from 'react';
import { useSelect } from '@wordpress/data';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useCurrentSupportInteraction } from '../../data/use-current-support-interaction';
import { getConversationIdFromInteraction, getOdieIdFromInteraction } from '../../utils';
import { useChatMessages } from './use-chat-messages';
import { useChatDerivedState } from './use-chat-derived-state';
import { useChatStatusFlags } from './use-chat-status-flags';
import { useOdieChatSync } from './use-odie-chat-sync';
import { useZendeskChatSync } from './use-zendesk-chat-sync';
import { useInteractionSync } from './use-interaction-sync';
import { getMessageUniqueIdentifier } from '../../components/message/utils/get-message-unique-identifier';
import type { Chat, OdieAllBotSlugs } from '../../types';
import type { HelpCenterSelect } from '@automattic/data-stores';
import { ODIE_DEFAULT_BOT_SLUG_LEGACY } from '../../constants';

/**
 * Main hook that combines all chat functionality.
 * Uses derived state pattern - state is computed from source data.
 *
 * This is the refactored version using the derived state approach.
 * Located in v2/ folder to avoid interfering with existing implementation.
 */
export const useGetCombinedChat = (
	canConnectToZendesk: boolean,
	isLoadingCanConnectToZendesk: boolean
) => {
	// Get current interaction
	const { data: currentInteraction } = useCurrentSupportInteraction();
	const odieId = getOdieIdFromInteraction( currentInteraction );
	const conversationId = getConversationIdFromInteraction( currentInteraction ) ?? null;

	// Get connection status from store
	const { isChatLoaded, connectionStatus } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			isChatLoaded: store.getIsChatLoaded(),
			connectionStatus: store.getZendeskConnectionStatus(),
		};
	}, [] );

	// Initialize message store
	const messages = useChatMessages();

	// Status flags for temporary UI states
	const statusFlags = useChatStatusFlags();

	// Sync data from providers
	const odieSync = useOdieChatSync( odieId ? Number( odieId ) : null, conversationId, messages );
	const zendeskSync = useZendeskChatSync(
		conversationId,
		odieId ? Number( odieId ) : null,
		canConnectToZendesk,
		isChatLoaded,
		( currentInteraction?.bot_slug || ODIE_DEFAULT_BOT_SLUG_LEGACY ) as OdieAllBotSlugs,
		messages,
		odieSync.odieChat // Pass odieChat to zendesk sync so it can get Odie messages
	);

	// Sync interaction changes
	const interactionSync = useInteractionSync( currentInteraction, messages );

	// Derive state from source data
	const derivedState = useChatDerivedState( {
		conversationId,
		odieId: odieSync.odieId,
		wpcomUserId: odieSync.wpcomUserId,
		isOdieLoading: odieSync.isFetching,
		isZendeskLoading: zendeskSync.isFetching,
		isRefreshingAfterReconnect: connectionStatus === 'reconnecting',
		isSending: statusFlags.isSending,
		isTransferring: statusFlags.isTransferring,
		interactionStatus: currentInteraction?.status ?? undefined,
		connectionStatus: connectionStatus ?? undefined,
	} );

	// Combine into Chat format (for backward compatibility)
	const mainChatState = useMemo< Chat >( () => {
		const state = {
			provider: derivedState.provider,
			status: derivedState.status,
			odieId: derivedState.odieId,
			conversationId: derivedState.conversationId,
			wpcomUserId: derivedState.wpcomUserId,
			messages: messages.messages,
			supportInteractionId: interactionSync.interactionId,
		};

		return state;
	}, [ derivedState, messages.messages, interactionSync.interactionId ] );

	// setMainChatState wrapper (for backward compatibility)
	const setMainChatState = useCallback(
		( updater: Chat | ( ( prev: Chat ) => Chat ) ) => {
			const newState = typeof updater === 'function' ? updater( mainChatState ) : updater;

			messages.replaceMessages( newState.messages );
		},
		[ mainChatState, messages ]
	);

	return {
		mainChatState,
		setMainChatState,
		statusFlags,
		messages,
	};
};
