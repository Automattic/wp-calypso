import { useMutation } from '@tanstack/react-query';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';
import { useCurrentSupportInteraction } from '../data/use-current-support-interaction';
import { getConversationIdFromInteraction } from '../utils';
import { useCreateZendeskConversation } from './use-create-zendesk-conversation';
import type { Message } from '../types';

/**
 * Send a message to the Zendesk conversation once.
 */
export const useSendZendeskMessageOnce = () => {
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();
	const currentConversationId = getConversationIdFromInteraction( currentSupportInteraction );

	const { chat } = useOdieAssistantContext();
	const conversationId = currentConversationId || chat.conversationId;

	return ( message: Message ) => {
		if ( ! conversationId ) {
			return;
		}

		const messageToSend = {
			type: 'text',
			text: message.content as string,
			...( message.payload && { payload: message.payload } ),
			...( message.metadata && { metadata: message.metadata } ),
		};

		Smooch.sendMessage( messageToSend, conversationId );
	};
};
/**
 * Send a message to the Zendesk conversation.
 */
export const useSendZendeskMessage = ( signal: AbortSignal ) => {
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();
	const currentConversationId = getConversationIdFromInteraction( currentSupportInteraction );

	const { chat, setChat } = useOdieAssistantContext();
	const newConversation = useCreateZendeskConversation();

	// < void, Error, { message: Message; signal: AbortSignal } >
	let conversationId = currentConversationId || chat.conversationId;
	return useMutation( {
		mutationKey: [ 'send-zendesk-messages' ],
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
			};

			Smooch.sendMessage( messageToSend, conversationId );
			return new Promise< Message >( ( resolve, reject ) => {
				// If the message is not sent within 5 seconds, reject the promise.
				// This allows Tanstack Query to retry the request if the user comes back online.
				const timeout = setTimeout( () => {
					reject( new Error( 'Message not sent' ) );
				}, 5000 );
				function onMessageSent( message: Message ) {
					if ( message.metadata?.temporary_id === messageToSend.metadata?.temporary_id ) {
						// @ts-expect-error -- 'off' is not part of the def.
						Smooch.off( 'message:sent', onMessageSent );
						resolve( message );
						clearTimeout( timeout );
					}
				}
				signal.onabort = reject;
				// When this isn't called, the promise will not resolve,
				// and Tanstack Query will automatically retry if they user comes back online 🔥.
				Smooch.on( 'message:sent', onMessageSent as any );
			} );
		},
		onSuccess: ( data: Message ) => {
			// Update the chat with the message that was sent
			setChat( ( chat ) => ( {
				...chat,
				messages: chat.messages.map( ( message ) =>
					message.metadata?.temporary_id === data.metadata?.temporary_id
						? { ...data, ...message }
						: message
				),
			} ) );
		},
		retry: true,
	} );
};
