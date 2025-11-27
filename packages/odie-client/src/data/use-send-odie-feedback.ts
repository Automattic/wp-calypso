import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { ODIE_DEFAULT_BOT_SLUG_LEGACY } from '../constants';
import { useOdieAssistantContext } from '../context';
import { useCurrentSupportInteraction } from './use-current-support-interaction';
import type { Chat } from '../types';

/**
 * It will send a message feedback.
 * @returns useMutation return object.
 */
export const useSendOdieFeedback = () => {
	const { chat, version } = useOdieAssistantContext();
	const { data: supportInteraction } = useCurrentSupportInteraction();
	const queryClient = useQueryClient();

	const botSlug = supportInteraction?.bot_slug || ODIE_DEFAULT_BOT_SLUG_LEGACY;

	return useMutation( {
		mutationFn: ( { messageId, ratingValue }: { messageId: number; ratingValue: number } ) => {
			return wpcomRequest( {
				method: 'POST',
				path: `/odie/chat/${ botSlug }/${ chat.odieId }/${ messageId }/feedback`,
				apiNamespace: 'wpcom/v2',
				body: { rating_value: ratingValue, ...( version && { version } ) },
			} );
		},
		onSuccess: ( data, { messageId, ratingValue } ) => {
			const queryKey = [ 'chat', botSlug, chat.odieId, 1, 30, true ];
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
