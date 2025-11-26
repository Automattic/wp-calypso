import { useMutation } from '@tanstack/react-query';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';
import { useCurrentSupportInteraction } from '../data/use-current-support-interaction';
import { getConversationIdFromInteraction, zendeskMessageConverter } from '../utils';
import { useCreateZendeskConversation } from './use-create-zendesk-conversation';
import type { Message, ZendeskMessage } from '../types';

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

	const { chat, setChat, updateMessage } = useOdieAssistantContext();
	const createZendeskConversation = useCreateZendeskConversation();

	// < void, Error, { message: Message; signal: AbortSignal } >
	let conversationId = currentConversationId || chat.conversationId;

	return useMutation< ZendeskMessage, Error, Message >( {
		mutationKey: [ 'send-zendesk-messages' ],
		mutationFn: async ( message: Message ): Promise< ZendeskMessage > => {
			if ( ! conversationId ) {
				// Start a new conversation if it doesn't exist
				// TODO: this can create excess tickets. We should track down the real issue.
				conversationId = await createZendeskConversation( { createdFrom: 'send_zendesk_message' } );
				setChat( ( prevChat ) => ( {
					...prevChat,
					conversationId,
				} ) );
			}

			const messageToSend = {
				type: 'text',
				text: message.content as string,
				...( message.payload && { payload: message.payload } ),
				...( message.metadata && { metadata: message.metadata } ),
			};

			Smooch.sendMessage( messageToSend, conversationId );
			return new Promise< ZendeskMessage >( ( resolve, reject ) => {
				// If the message is not sent within 5 seconds, reject the promise.
				// This allows Tanstack Query to retry the request if the user comes back online.
				const timeout = setTimeout( () => {
					reject( new Error( 'Message not sent' ) );
				}, 5000 );
				function onMessageSent( zendeskMessage: ZendeskMessage ) {
					if ( zendeskMessage.metadata?.temporary_id === messageToSend.metadata?.temporary_id ) {
						// @ts-expect-error -- 'off' is not part of the def.
						Smooch.off( 'message:sent', onMessageSent );
						resolve( zendeskMessage );
						clearTimeout( timeout );
					}
				}
				signal.onabort = reject;
				// When this isn't called, the promise will not resolve,
				// and Tanstack Query will automatically retry if they user comes back online 🔥.
				Smooch.on( 'message:sent', onMessageSent as any );
			} );
		},
		onSuccess: ( data: ZendeskMessage ) => {
			// Convert Zendesk message to our Message format
			const convertedMessage = zendeskMessageConverter( data );
			// Update the existing message (matching by temporary_id) with the received version
			// This will update the message to show it in brighter color (received status)
			updateMessage( convertedMessage, 'temporary_id' );
		},
		retry: true,
	} );
};
