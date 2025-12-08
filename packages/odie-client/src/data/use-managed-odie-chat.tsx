import { SummaryButton } from '@automattic/components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { useOdieAssistantContext } from '../context';
import { getOdieIdFromInteraction } from '../utils';
import { useCurrentSupportInteraction } from './use-current-support-interaction';
import { useManageSupportInteraction } from './use-manage-support-interaction';
import { useOdieChat } from './use-odie-chat';
import type {
	ReturnedChat,
	Message,
	AgentticMessage,
	OdieChat,
	SupportInteraction,
} from '../types';

function convertMessageToAgentticFormat(
	message: Message,
	chatId: number | null,
	navigate: ( path: string ) => void
): AgentticMessage {
	if ( message.context?.flags?.agent_handover === '1' ) {
		return {
			content: [
				{
					type: 'component',
					component: () => (
						<SummaryButton
							title={ __( 'Switch to Build assistant', __i18n_text_domain__ ) }
							description={ __( 'A new chat will start', __i18n_text_domain__ ) }
							onClick={ () => navigate( `/chat?startedFrom=odie&chatId=${ chatId }` ) }
							className="agent-handover-summary-button"
						/>
					),
				},
			],
			role: message.role as 'agent',
			timestamp: message.received as number,
			id: message.message_id?.toString() ?? '',
			actions: [],
			archived: false,
			showIcon: true,
		};
	}
	return {
		content: [ { type: 'text', text: message.content as string } ],
		role: message.role as 'agent',
		timestamp: message.received as number,
		id: message.message_id?.toString() ?? '',
		actions: [],
		archived: false,
		showIcon: true,
	};
}

function convertMessageFromAgentticFormat( message: string ): Message {
	return {
		content: message,
		role: 'user',
		type: 'message',
	};
}

/**
 * Sends a new message to ODIE.
 * @returns useMutation return object.
 */
export const useSendOdieMessage = () => {
	const versionParam = new URLSearchParams( window.location.search ).get( 'version' );
	const {
		selectedSiteId,
		version = versionParam,
		newInteractionsBotSlug,
	} = useOdieAssistantContext();
	const {
		data: currentSupportInteraction,
		promise: currentSupportInteractionPromise,
		isFetching: isFetchingCurrentSupportInteraction,
	} = useCurrentSupportInteraction();
	const botSlug = currentSupportInteraction?.bot_slug || newInteractionsBotSlug;
	const chatId = getOdieIdFromInteraction( currentSupportInteraction );
	const { startNewInteraction } = useManageSupportInteraction();

	const queryClient = useQueryClient();

	return useMutation< { chat: ReturnedChat; interaction: SupportInteraction }, Error, Message >( {
		mutationFn: async ( message: Message ) => {
			const chatIdSegment = chatId ? `/${ chatId }` : '';
			const url = window.location.href;
			const pathname = window.location.pathname;
			let interaction = currentSupportInteraction;

			// This prevents a race condition where the current support interaction is not fetched yet.
			if ( isFetchingCurrentSupportInteraction ) {
				interaction = await currentSupportInteractionPromise;
			}

			const chat = await ( canAccessWpcomApis()
				? wpcomRequest< ReturnedChat >( {
						method: 'POST',
						path: `/odie/chat/${ botSlug }${ chatIdSegment }`,
						apiNamespace: 'wpcom/v2',
						body: {
							message: message.content,
							...( version && { version } ),
							context: { selectedSiteId, url, pathname },
						},
				  } )
				: apiFetch< ReturnedChat >( {
						path: `/help-center/odie/chat/${ botSlug }${ chatIdSegment }`,
						method: 'POST',
						data: {
							message: message.content,
							...( version && { version } ),
							context: { selectedSiteId, url, pathname },
						},
				  } ) );

			if ( ! interaction ) {
				interaction = await startNewInteraction( {
					event_source: 'odie',
					event_external_id: chat.chat_id.toString(),
				} );
			}

			return { chat, interaction };
		},
		onMutate( message: Message ) {
			queryClient.setQueryData(
				[ 'odie-chat', botSlug, chatId ? Number( chatId ) : undefined, version ],
				( currentChatCache: OdieChat ) => {
					return {
						...currentChatCache,
						messages: [ ...( currentChatCache?.messages ?? [] ), message ],
					};
				}
			);
		},
		onSuccess( data ) {
			queryClient.setQueryData(
				[ 'odie-chat', botSlug, data.chat.chat_id, version ],
				( currentChatCache: OdieChat ) => {
					return {
						...currentChatCache,
						messages: [ ...( currentChatCache?.messages ?? [] ), ...data.chat.messages ],
					};
				}
			);
		},
		onError() {
			// handle errors gracefully.
		},
	} );
};

/**
 * Get a full API of an Odie chat.
 */
export const useManagedOdieChat = () => {
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();
	const chatId = getOdieIdFromInteraction( currentSupportInteraction );
	const { data: chat, isFetching: isLoadingChat } = useOdieChat( chatId ? Number( chatId ) : null );
	const navigate = useNavigate();

	const sendOdieMessage = useSendOdieMessage();

	async function sendMessage( message: string ) {
		const odieMessage = convertMessageFromAgentticFormat( message );
		const { interaction } = await sendOdieMessage.mutateAsync( odieMessage );

		if ( interaction.uuid !== currentSupportInteraction?.uuid ) {
			navigate( `/odie?odieInteractionId=${ interaction.uuid }`, { replace: true } );
		}
	}

	return {
		messages:
			chat?.messages.map( ( message ) =>
				convertMessageToAgentticFormat( message, chatId ? Number( chatId ) : null, navigate )
			) || [],
		sendMessage,
		isProcessing: sendOdieMessage.isPending || isLoadingChat,
	};
};
