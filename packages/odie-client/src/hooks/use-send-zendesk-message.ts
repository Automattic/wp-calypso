import { useMutation } from '@tanstack/react-query';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';
import { useCurrentSupportInteraction } from '../data/use-current-support-interaction';
import { getConversationIdFromInteraction } from '../utils';
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
 * How long to wait for `message:sent` once Smooch has the server's answer. It usually fires a few
 * milliseconds later, and never when the send failed.
 */
const MESSAGE_SENT_GRACE_MS = 1000;

type SmoochStoredMessage = {
	metadata?: { temporary_id?: string };
	sendStatus?: string;
};

/**
 * Find the message the server accepted for this temporary id. Smooch also keeps the messages it
 * is still sending, or failed to send, in the conversation, flagged with a `sendStatus`.
 */
async function findDeliveredMessage( conversationId: string, temporaryId: string ) {
	try {
		const conversation = await Smooch.getConversationById( conversationId );
		const messages = ( conversation?.messages ?? [] ) as unknown as SmoochStoredMessage[];
		const message = messages.find(
			( storedMessage ) =>
				storedMessage.metadata?.temporary_id === temporaryId && ! storedMessage.sendStatus
		);
		return message as unknown as Message | undefined;
	} catch {
		return undefined;
	}
}

function listenForMessageSent( temporaryId: string ) {
	let onMessageSent: ( message: Message ) => void = () => {};
	const sent = new Promise< Message >( ( resolve ) => {
		onMessageSent = ( message ) => {
			if ( message.metadata?.temporary_id === temporaryId ) {
				resolve( message );
			}
		};
	} );
	Smooch.on( 'message:sent', onMessageSent as any );

	return {
		sent,
		// @ts-expect-error -- 'off' is not part of the def.
		stop: () => Smooch.off?.( 'message:sent', onMessageSent ),
	};
}

/**
 * Send a message to the Zendesk conversation.
 */
export const useSendZendeskMessage = ( signal: AbortSignal ) => {
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();
	const currentConversationId = getConversationIdFromInteraction( currentSupportInteraction );

	const { chat, setChat, trackEvent } = useOdieAssistantContext();

	// < void, Error, { message: Message; signal: AbortSignal } >
	const conversationId = currentConversationId || chat.conversationId;
	return useMutation( {
		mutationKey: [ 'send-zendesk-messages' ],
		mutationFn: async ( message: Message ): Promise< Message > => {
			// The temporary id is how a retry recognizes that an earlier attempt already got through.
			const temporaryId = message.metadata?.temporary_id ?? crypto.randomUUID();
			const messageToSend = {
				type: 'text',
				text: message.content as string,
				...( message.payload && { payload: message.payload } ),
				metadata: { ...message.metadata, temporary_id: temporaryId },
			};

			if ( ! conversationId ) {
				trackEvent( 'send_zendesk_message_failed', {
					conversation_id: conversationId,
					interaction_id: currentSupportInteraction?.uuid,
				} );
				throw new Error( 'Message not sent' );
			}

			if ( signal.aborted ) {
				throw new Event( 'abort' );
			}

			const alreadySent = await findDeliveredMessage( conversationId, temporaryId );
			if ( alreadySent ) {
				return alreadySent;
			}

			const listener = listenForMessageSent( temporaryId );
			let graceTimeout: ReturnType< typeof setTimeout > | undefined;
			try {
				// Despite its type, this returns a promise. It settles only once the server answers, however
				// long that takes, so a slow network doesn't make us post the message again. It rejects while
				// Smooch isn't initialized, and resolves even when the send failed.
				await ( Smooch.sendMessage( messageToSend, conversationId ) as unknown as Promise< void > );

				const sent = await Promise.race( [
					listener.sent,
					new Promise< Message | undefined >( ( resolve ) => {
						graceTimeout = setTimeout(
							() => resolve( findDeliveredMessage( conversationId, temporaryId ) ),
							MESSAGE_SENT_GRACE_MS
						);
					} ),
				] );
				if ( ! sent ) {
					// Tanstack Query retries, and pauses while offline until the connection comes back.
					throw new Error( 'Message not sent' );
				}
				return sent;
			} finally {
				clearTimeout( graceTimeout );
				listener.stop();
			}
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
