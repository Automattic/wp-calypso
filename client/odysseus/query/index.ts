import { useMutation, UseMutationResult, useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useOdysseusAssistantContext } from '../context';
import type { Chat, Message, Context } from '../types';

function odysseusSendMessage( messages: Message[], context: Context, chat_id?: string | null ) {
	const path = `/odie/send_message`;
	return wpcom.req.post( {
		path,
		apiNamespace: 'wpcom/v2',
		body: { messages, context, chat_id: chat_id },
	} );
}

// It will post a new message using the current chat_id
export const useOddyseusSendMessage = (): UseMutationResult<
	{ chat_id: string; messages: Message[] },
	unknown,
	{ message: Message }
> => {
	const { chat, setChat } = useOdysseusAssistantContext();

	return useMutation( {
		mutationFn: ( { message }: { message: Message } ) => {
			// If chat_id is defined, we only send the message to the current chat
			// Otherwise we send previous messages and the new one appended to the end to the server
			const messagesToSend = chat?.chat_id ? [ message ] : [ ...chat.messages, message ];

			return odysseusSendMessage( messagesToSend, chat.context, chat.chat_id );
		},
		onSuccess: ( data ) => {
			setChat( { ...chat, chat_id: data.chat_id } );
		},
	} );
};

// TODO: We will add lately a clear chat to forget the session

const odysseusGetChat = ( chat_id: string | null ) => {
	const path = `/odie/get_chat/${ chat_id }`;
	return wpcom.req.get( {
		path,
		apiNamespace: 'wpcom/v2',
	} );
};

export const useOdysseusGetChatPollQuery = ( chat_id: string | null ) => {
	return useQuery< Chat, Error >( {
		queryKey: [ 'odysseus-get-chat', chat_id ],
		queryFn: async () => await odysseusGetChat( chat_id ),
		refetchInterval: 5000,
		refetchOnWindowFocus: false,
		enabled: !! chat_id,
	} );
};
