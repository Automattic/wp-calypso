import { useMutation } from '@tanstack/react-query';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';
import { useCurrentSupportInteraction } from '../data/use-current-support-interaction';
import { getConversationIdFromInteraction } from '../utils';
import { useCreateZendeskConversation } from './use-create-zendesk-conversation';
import type { Message } from '../types';

/**
 * Send a message to the Zendesk conversation.
 */
export const useSendZendeskMessage = ( signal: AbortSignal ) => {
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();
	const currentConversationId = getConversationIdFromInteraction( currentSupportInteraction );

	const { setChatStatus, chat, setChat } = useOdieAssistantContext();
	const newConversation = useCreateZendeskConversation();

	// < void, Error, { message: Message; signal: AbortSignal } >
	let conversationId = currentConversationId || chat.conversationId;
	return useMutation( {
		mutationFn: async ( message: Message ): Promise< Message > => {
			if ( ! conversationId ) {
				// Start a new conversation if it doesn't exist
				// TODO: this can create excess tickets. We should track down the real issue.
				conversationId = await newConversation( { createdFrom: 'send_zendesk_message' } );
				setChat( {
					...chat,
					conversationId,
				} );
			}

			const messageToSend = {
				type: 'text',
				text: message.content as string,
				...( message.payload && { payload: message.payload } ),
				...( message.metadata && { metadata: message.metadata } ),
				isSending: true,
			};

			Smooch.sendMessage( messageToSend, conversationId );
			return new Promise< Message >( ( resolve, reject ) => {
				function onMessageSent( message: Message ) {
					// @ts-expect-error -- 'off' is not part of the def.
					Smooch.off( 'message:sent', onMessageSent );
					resolve( message );
				}
				signal.onabort = reject;
				// When this isn't called, the promise will not resolve,
				// and Tanstack Query will automatically retry if they user comes back online 🔥.
				Smooch.on( 'message:sent', onMessageSent as any );
			} );
		},
		onMutate: () => {
			setChatStatus( 'sending' );
		},
		onSettled: () => {
			setChatStatus( 'loaded' );
		},
		onSuccess: ( data: Message ) => {
			// Update the chat with the message that was sent
			setChat( ( chat ) => ( {
				...chat,
				messages: chat.messages.map( ( message ) =>
					message.metadata?.temporary_id === data.metadata?.temporary_id
						? { ...message, isSending: false }
						: message
				),
			} ) );
			setChatStatus( 'loaded' );
		},
		onError: ( error ) => {
			if ( error instanceof Event && error.type === 'abort' ) {
				setChatStatus( 'loaded' );
			}
		},
	} );
};
