import { loadAllMessagesFromServer, type UseAgentChatConfig } from '@automattic/agenttic-client';
import { SummaryButton, TimeSince } from '@automattic/components';
import { useGetZendeskConversations } from '@automattic/zendesk-client';
import { createInterpolateElement, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants';
import { useAgentsManagerContext } from '../../contexts';
import { getConversationBotId } from '../../utils/conversation-bot-id';
import type { ZendeskConversation } from '../../types';
import './style.scss';

function getConversationChatSessionId( conversation: ZendeskConversation ) {
	const metadataChatSessionId = conversation.metadata?.chat_session_id;
	const { chat_session_id: conversationChatSessionId } = conversation as ZendeskConversation & {
		chat_session_id?: unknown;
	};

	if ( typeof conversationChatSessionId === 'string' ) {
		return conversationChatSessionId;
	}

	return typeof metadataChatSessionId === 'string' ? metadataChatSessionId : undefined;
}

function getTimestampInMilliseconds( timestamp: unknown ) {
	if ( typeof timestamp === 'number' && Number.isFinite( timestamp ) ) {
		return timestamp > 9999999999 ? timestamp : timestamp * 1000;
	}

	if ( typeof timestamp === 'string' ) {
		const parsedTimestamp = Number( timestamp );
		if ( Number.isFinite( parsedTimestamp ) ) {
			return parsedTimestamp > 9999999999 ? parsedTimestamp : parsedTimestamp * 1000;
		}
	}

	return undefined;
}

function getConversationStartedAt( conversation: ZendeskConversation ) {
	const createdAt = getTimestampInMilliseconds( conversation.metadata?.createdAt );
	if ( createdAt ) {
		return new Date( createdAt ).toISOString();
	}

	const firstMessageReceivedAt = getTimestampInMilliseconds(
		conversation.messages?.[ 0 ]?.received
	);
	if ( firstMessageReceivedAt ) {
		return new Date( firstMessageReceivedAt ).toISOString();
	}

	const lastUpdatedAt = getTimestampInMilliseconds( conversation.lastUpdatedAt );
	return lastUpdatedAt ? new Date( lastUpdatedAt ).toISOString() : undefined;
}

export function findConversationByChatSessionId(
	conversations: ZendeskConversation[],
	chatSessionId: string
) {
	if ( ! chatSessionId ) {
		return undefined;
	}

	return conversations.find(
		( conversation ) => getConversationChatSessionId( conversation ) === chatSessionId
	);
}

function getExistingConversationButtonDescription( startedAt?: string ) {
	if ( ! startedAt ) {
		return __( 'Return to your human chat' );
	}

	return createInterpolateElement( __( 'Continue chat started <time></time>' ), {
		time: <TimeSince className="agents-manager__escalation-button-time" date={ startedAt } />,
	} );
}

async function getAiChatIdFromSession(
	agentConfig: UseAgentChatConfig | null,
	chatSessionId: string
) {
	if ( ! agentConfig || ! chatSessionId ) {
		return undefined;
	}

	try {
		const urlSearchParams = new URLSearchParams( window.location.search );
		const botId = getConversationBotId( agentConfig.agentId, urlSearchParams.has( 'agent' ) );
		const { chatId } = await loadAllMessagesFromServer(
			chatSessionId,
			{
				botId,
				apiBaseUrl: API_BASE_URL,
				authProvider: agentConfig.authProvider,
			},
			1,
			true
		);

		return Number.isFinite( chatId ) && chatId > 0 ? chatId : undefined;
	} catch {
		return undefined;
	}
}

export function EscalationButton( { messageId }: { messageId: string } ) {
	const { agentConfig, getActiveSessionId, zendeskSmoochIntegrationKey } =
		useAgentsManagerContext();
	const navigate = useNavigate();
	const activeSessionId = getActiveSessionId();
	const [ isStartingNewConversation, setIsStartingNewConversation ] = useState( false );

	const { conversations, isLoading } = useGetZendeskConversations(
		!! activeSessionId,
		zendeskSmoochIntegrationKey
	);
	const existingConversation = useMemo(
		() => findConversationByChatSessionId( conversations, activeSessionId ),
		[ conversations, activeSessionId ]
	);
	const existingConversationStartedAt = existingConversation
		? getConversationStartedAt( existingConversation )
		: undefined;

	return (
		<SummaryButton
			className="agents-manager__escalation-button"
			title={
				existingConversation ? __( 'Continue existing chat' ) : __( 'Switch to Happiness Engineer' )
			}
			description={
				existingConversation
					? getExistingConversationButtonDescription( existingConversationStartedAt )
					: __( 'A new chat will start' )
			}
			disabled={ isLoading || isStartingNewConversation }
			onClick={ async () => {
				const currentChatSessionId = getActiveSessionId();
				const currentExistingConversation = findConversationByChatSessionId(
					conversations,
					currentChatSessionId
				);

				if ( currentExistingConversation ) {
					navigate( '/zendesk', {
						state: { conversationId: currentExistingConversation.id },
					} );
					return;
				}

				setIsStartingNewConversation( true );
				const aiChatId = await getAiChatIdFromSession( agentConfig, currentChatSessionId );

				navigate( '/zendesk', {
					state: {
						startedFromChatSessionId: currentChatSessionId,
						...( aiChatId ? { startedFromAiChatId: aiChatId } : {} ),
						startedFromMessageId: messageId,
					},
				} );
			} }
		/>
	);
}
