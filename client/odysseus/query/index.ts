import { useMutation, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { Nudge, useOdysseusAssistantContext } from '../context';
import type { Message } from '../context';

function odysseusSendMessage(
	siteId: number | null,
	messages: Message[],
	context: Nudge,
	sectionName: string,
	chatId?: string | null
) {
	const path = `/odysseus/send_message`;
	return wpcom.req.post( {
		path,
		apiNamespace: 'wpcom/v2',
		body: { messages, context, sectionName, siteId, chatId },
	} );
}

// It will post a new message using the current chatId
export const useOddyseusSendMessage = (
	siteId: number | null
): UseMutationResult<
	{ chatId: string; message: Message },
	unknown,
	{ message: Message; context: Nudge }
> => {
	const { sectionName, chat, messages, setChat } = useOdysseusAssistantContext();

	return useMutation( {
		mutationFn: ( { message, context }: { message: Message; context: Nudge } ) => {
			// If chatId is defined, we only send the message to the current chat
			// Otherwise we send previous messages and the new one appended to the end to the server
			const messagesToSend = chat?.chatId ? [ message ] : [ ...messages, message ];

			return odysseusSendMessage( siteId, messagesToSend, context, sectionName, chat.chatId );
		},
		onSuccess: ( data ) => {
			// After a successful mutation, update the chat state with the new chatId
			//It should be immediate (eg using the useState parameter of the hook) (only update chatId)
			setChat( { ...chat, chatId: data.chatId } );
		},
	} );
};

// TODO: We will add lately a clear chat to forget the session
