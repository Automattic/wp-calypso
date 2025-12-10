import { MessageDivider } from '@automattic/agenttic-ui';
import { SummaryButton } from '@automattic/components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { useOdieAssistantContext } from '../../context';
import { getOdieIdFromInteraction } from '../../utils';
import { useCurrentSupportInteraction } from '../use-current-support-interaction';
import { useManageSupportInteraction } from '../use-manage-support-interaction';
import { useOdieChat } from '../use-odie-chat';
import type {
	ReturnedChat,
	Message,
	OdieChat,
	SupportInteraction,
	AgentticMessage,
} from '../../types';
import type { AgentManager } from '@automattic/agenttic-client';

type Agent = Awaited< ReturnType< AgentManager[ 'createAgent' ] > >;

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
							role: message.role,
							...( version && { version } ),
							context: { ...message.context, selectedSiteId, url, pathname },
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

function useTransformMessageToAgenttic(
	onTransferToOrchestrator: () => Promise< Agent | undefined >
) {
	const navigate = useNavigate();
	const { mutateAsync: sendOdieMessage } = useSendOdieMessage();
	const [ isPending, setIsPending ] = useState( false );

	const handleAgentHandover = useCallback(
		async ( chatId: number, sourceMessageId: string, triggeringMessage: string ) => {
			setIsPending( true );
			const newChat = await onTransferToOrchestrator();
			if ( ! newChat ) {
				return;
			}
			const task = await newChat.sendMessage( {
				message: {
					messageId: '',
					role: 'user',
					parts: [
						{
							type: 'text',
							text: triggeringMessage,
						},
					],
					kind: 'message',
				},
			} );
			await sendOdieMessage( {
				content: 'orchestrator',
				role: 'navigation',
				type: 'message',
				context: {
					source_message_id: sourceMessageId,
					destination_chat_id: task.sessionId,
					destination_chat_type: 'orchestrator',
					site_id: null,
				},
			} );
			setIsPending( false );
			navigate( `/chat?startedFrom=odie&chatId=${ chatId }`, {
				state: { sessionId: task.sessionId },
			} );
		},
		[ navigate, sendOdieMessage, onTransferToOrchestrator ]
	);

	return useCallback(
		( messages: Message[], chatId: number | null ): AgentticMessage[] => {
			return messages.map( ( message, index ) => {
				if ( message.role === 'navigation' ) {
					return {
						id: message.message_id?.toString() ?? '',
						role: 'agent' as const,
						timestamp: message.received as number,
						archived: false,
						showIcon: true,
						content: [
							{
								type: 'component' as const,
								component: () => (
									<MessageDivider
										message={
											createInterpolateElement(
												__( 'Switched to <a>a new chat</a>', __i18n_text_domain__ ),
												{
													a: (
														<Button
															variant="link"
															onClick={ () =>
																navigate( '/chat', {
																	state: { sessionId: message.context?.destination_chat_id },
																} )
															}
														/>
													),
												}
											) as unknown as string
										}
									/>
								),
								timestamp: message.received as number,
							},
						],
					};
				}
				if ( chatId && message.context?.flags?.agent_handover === '1' ) {
					const previousMessage = messages[ index - 1 ];
					const alreadyHandedOver = messages.find(
						( m ) => m.context?.source_message_id === message.message_id?.toString()
					);

					const description = alreadyHandedOver
						? __( 'Handled by the Build assistant', __i18n_text_domain__ )
						: __( 'A new chat will start', __i18n_text_domain__ );

					return {
						timestamp: message.received as number,
						archived: false,
						showIcon: true,
						content: [
							{
								type: 'text',
								text: message.content as string,
							},
							{
								type: 'component',
								component: () => (
									<SummaryButton
										title={
											alreadyHandedOver
												? __( 'Continue with the Build assistant', __i18n_text_domain__ )
												: __( 'Switch to Build assistant', __i18n_text_domain__ )
										}
										description={
											isPending
												? __( 'Forwarding your messages…', __i18n_text_domain__ )
												: description
										}
										disabled={ isPending }
										onClick={ () =>
											alreadyHandedOver
												? navigate( `/chat?startedFrom=odie&chatId=${ chatId }`, {
														state: {
															sessionId: alreadyHandedOver?.context?.destination_chat_id,
														},
												  } )
												: handleAgentHandover(
														chatId,
														message.message_id?.toString() ?? '',
														previousMessage.content as string
												  )
										}
										className="agent-handover-summary-button"
									/>
								),
							},
						],
						role: message.role as 'agent',
						id: message.message_id?.toString() ?? '',
						actions: [],
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
			} );
		},
		[ handleAgentHandover, isPending, navigate ]
	);
}

/**
 * Get a full API of an Odie chat.
 */
export const useManagedOdieChat = ( {
	onTransferToOrchestrator,
}: {
	onTransferToOrchestrator: () => Promise< Agent | undefined >;
} ) => {
	const versionParam = new URLSearchParams( window.location.search ).get( 'version' );
	const [ messages, setMessages ] = useState< Message[] >( [] );
	const [ chatId, setChatId ] = useState< number | null >( null );
	const { version = versionParam } = useOdieAssistantContext();
	const { data: currentSupportInteraction, isFetching: isFetchingCurrentSupportInteraction } =
		useCurrentSupportInteraction();

	const transformMessageToAgenttic = useTransformMessageToAgenttic( onTransferToOrchestrator );

	const { data: chat, isFetching: isLoadingChat } = useOdieChat(
		chatId ? Number( chatId ) : null,
		version
	);

	useEffect( () => {
		if ( currentSupportInteraction ) {
			const odieId = getOdieIdFromInteraction( currentSupportInteraction );
			setChatId( odieId ? Number( odieId ) : null );
		}
	}, [ currentSupportInteraction ] );

	useEffect( () => {
		if ( chat?.odieId && messages.length === 0 ) {
			setMessages( chat.messages );
			setChatId( chat.odieId );
		}
	}, [ chat, messages ] );

	const navigate = useNavigate();

	const sendOdieMessage = useSendOdieMessage();

	async function sendMessage( message: string ) {
		const odieMessage = convertMessageFromAgentticFormat( message );
		setMessages( ( messages ) => [ ...messages, odieMessage ] );
		const { interaction, chat: returnedChat } = await sendOdieMessage.mutateAsync( odieMessage );
		setMessages( ( messages ) => [ ...messages, ...returnedChat.messages ] );
		if ( interaction.uuid !== currentSupportInteraction?.uuid ) {
			navigate( `/odie?odieInteractionId=${ interaction.uuid }`, { replace: true } );
		}
	}

	return {
		messages: transformMessageToAgenttic( messages, chatId ),
		sendMessage,
		isProcessing: sendOdieMessage.isPending || isLoadingChat || isFetchingCurrentSupportInteraction,
	};
};
