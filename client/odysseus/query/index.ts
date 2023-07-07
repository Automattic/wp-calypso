import { useMutation, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { Context, useOdysseusAssistantContext } from '../context';
import type { Message } from '../context';

function odysseusSendMessage(
	siteId: number | null,
	messages: Message[],
	context: Context,
	chat_id?: string | null
) {
	const path = `/odysseus/send_message`;
	return wpcom.req.post( {
		path,
		apiNamespace: 'wpcom/v2',
		body: { messages, context, siteId, chat_id: chat_id },
	} );
}

// It will post a new message using the current chatId
export const useOddyseusSendMessage = (
	siteId: number | null
): UseMutationResult<
	{ chat_id: string; message: Message },
	unknown,
	{ message: Message; context: Context }
> => {
	const { chat, setChat } = useOdysseusAssistantContext();

	return useMutation( {
		mutationFn: ( { message, context }: { message: Message; context: Context } ) => {
			// If chatId is defined, we only send the message to the current chat
			// Otherwise we send previous messages and the new one appended to the end to the server
			const messagesToSend = chat?.chat_id ? [ message ] : [ ...chat.messages, message ];

			return odysseusSendMessage( siteId, messagesToSend, context, chat.chat_id );
		},
		onSuccess: ( data ) => {
			setChat( { ...chat, chat_id: data.chat_id } );
		},
	} );
};

// TODO: We will add lately a clear chat to forget the session
