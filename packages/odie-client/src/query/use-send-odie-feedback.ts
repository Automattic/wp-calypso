import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { useOdieAssistantContext } from '../context';
import { useGetOdieStorage } from '../data';
import type { Chat } from '../types/';

/**
 * It will send a message feedback.
 * @returns useMutation return object.
 */
export const useSendOdieFeedback = () => {
	const chatId = useGetOdieStorage( 'chat_id' );
	const { botNameSlug } = useOdieAssistantContext();
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: ( { messageId, ratingValue }: { messageId: number; ratingValue: number } ) => {
			return wpcomRequest( {
				method: 'POST',
				path: `/odie/chat/${ botNameSlug }/${ chatId }/${ messageId }/feedback`,
				apiNamespace: 'wpcom/v2',
				body: { rating_value: ratingValue },
			} );
		},
		onSuccess: ( data, { messageId, ratingValue } ) => {
			const queryKey = [ 'chat', botNameSlug, chatId, 1, 30, true ];
			queryClient.setQueryData( queryKey, ( currentChatCache: Chat ) => {
				if ( ! currentChatCache ) {
					return;
				}

				return {
					...currentChatCache,
					messages: currentChatCache.messages.map( ( m ) =>
						m.message_id === messageId ? { ...m, rating_value: ratingValue } : m
					),
				};
			} );
		},
	} );
};
