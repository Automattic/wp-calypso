import { useMutation, UseMutationResult, useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { canAccessWpcomApis } from 'wpcom-proxy-request';
import wpcom from 'calypso/lib/wp';
import { useOdieAssistantContext } from '../context';
import { setOdieStorage } from '../data';
import type { Chat, Message, OdieAllowedBots } from '../types';

// Either we use wpcom or apiFetch for the request for accessing odie endpoint for atomic or wpcom sites
const buildSendChatMessage = (
	message: Message,
	botNameSlug: OdieAllowedBots,
	chat_id?: number | null
) => {
	const baseApiPath = '/help-center/odie/chat/';
	const wpcomBaseApiPath = '/odie/chat/';

	const apiPathWithIds =
		chat_id !== null && chat_id !== undefined
			? `${ baseApiPath }${ botNameSlug }/${ chat_id }`
			: `${ baseApiPath }${ botNameSlug }`;

	const wpcomApiPathWithIds =
		chat_id !== null && chat_id !== undefined
			? `${ wpcomBaseApiPath }${ botNameSlug }/${ chat_id }`
			: `${ wpcomBaseApiPath }${ botNameSlug }`;

	return canAccessWpcomApis()
		? odieWpcomSendSupportMessage( message, wpcomApiPathWithIds )
		: apiFetch( {
				path: apiPathWithIds,
				method: 'POST',
				data: { message },
		  } );
};

function odieWpcomSendSupportMessage( message: Message, path: string ) {
	return wpcom.req.post( {
		path,
		apiNamespace: 'wpcom/v2',
		body: { message: message.content },
	} );
}

// It will post a new message using the current chat_id
export const useOdieSendMessage = (): UseMutationResult<
	{ chat_id: string; messages: Message[] },
	unknown,
	{ message: Message }
> => {
	const { chat, setChat, botNameSlug, setIsLoading } = useOdieAssistantContext();

	return useMutation( {
		mutationFn: ( { message }: { message: Message } ) => {
			return buildSendChatMessage( message, botNameSlug, chat.chat_id );
		},
		onSuccess: ( data ) => {
			setChat( { messages: chat.messages, chat_id: parseInt( data.chat_id ) } );
			setOdieStorage( 'chat_id', data.chat_id );
		},
		onMutate: () => {
			setIsLoading( true );
		},
		onSettled: () => {
			setIsLoading( false );
		},
	} );
};

const buildGetChatMessage = (
	botNameSlug: OdieAllowedBots,
	chat_id: number | null | undefined,
	page: number,
	perPage: number,
	includeFeedback: boolean
): Promise< Chat > => {
	const urlQueryParams = new URLSearchParams( {
		page_number: page.toString(),
		items_per_page: perPage.toString(),
		include_feedback: includeFeedback.toString(),
	} );
	const baseApiPath = `/help-center/odie/chat/${ botNameSlug }/${ chat_id }?${ urlQueryParams.toString() }`;
	const wpcomBaseApiPath = `/odie/chat/${ botNameSlug }/${ chat_id }?${ urlQueryParams.toString() }`;

	return canAccessWpcomApis()
		? odieWpcomGetChat( wpcomBaseApiPath )
		: ( apiFetch( {
				path: baseApiPath,
				method: 'GET',
		  } ) as Promise< Chat > );
};

function odieWpcomGetChat( path: string ): Promise< Chat > {
	return wpcom.req.get( {
		path,
		apiNamespace: 'wpcom/v2',
	} ) as Promise< Chat >;
}

export const useOdieGetChat = (
	botNameSlug: OdieAllowedBots,
	chatId: number | undefined | null,
	page = 1,
	perPage = 10,
	includeFeedback = true
) => {
	const { chat } = useOdieAssistantContext();
	return useQuery< Chat, unknown >( {
		queryKey: [ 'chat', botNameSlug, chatId, page, perPage, includeFeedback ],
		queryFn: () => buildGetChatMessage( botNameSlug, chatId, page, perPage, includeFeedback ),
		refetchOnWindowFocus: false,
		enabled: !! chatId && ! chat.chat_id,
	} );
};

const odieWpcomSendMessageFeedback = (
	botNameSlug: OdieAllowedBots,
	chatId: number,
	messageId: number,
	rating_value: number
) => {
	const path = `/odie/chat/${ botNameSlug }/${ chatId }/${ messageId }/feedback`;

	return wpcom.req.post( {
		path,
		apiNamespace: 'wpcom/v2',
		body: { rating_value },
	} );
};

// It will post a new message using the current chat_id
export const useOdieSendMessageFeedback = (): UseMutationResult<
	number,
	unknown,
	{ rating_value: number; message: Message }
> => {
	const { chat, botNameSlug } = useOdieAssistantContext();

	return useMutation( {
		mutationFn: ( { rating_value, message }: { rating_value: number; message: Message } ) => {
			return odieWpcomSendMessageFeedback(
				botNameSlug,
				chat.chat_id || 0,
				message.message_id || 0,
				rating_value
			);
		},
	} );
};
