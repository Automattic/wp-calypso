import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { ODIE_DEFAULT_BOT_SLUG } from '../constants';
import { useOdieAssistantContext } from '../context';
import { getTimestamp } from '../utils';
import type { OdieConversation, SupportInteraction } from '../types';

/**
 * Retrieves the list of conversations handled by AI.
 */
export const useGetOdieConversations = (
	supportInteractions: SupportInteraction[] = [],
	enabled = true
) => {
	const { version } = useOdieAssistantContext();
	const botSlugs = encodeURIComponent(
		Array.from(
			new Set(
				supportInteractions?.map( ( interaction ) => {
					// Fallback to `wpcom-support-chat` in case this is an old interaction without bot_slug property.
					// In the Help Center, up to October 2025, all interactions were created with `wpcom-support-chat` bot.
					return interaction.bot_slug || ODIE_DEFAULT_BOT_SLUG;
				} )
			)
		).join( ',' )
	);

	return useQuery< OdieConversation[], Error >( {
		queryKey: [ 'odie-interactions', botSlugs, version ],
		queryFn: async (): Promise< OdieConversation[] > => {
			const queryParams = new URLSearchParams( {
				page_number: '1',
				items_per_page: '30',
				truncation_method: 'first_message',
			} ).toString();

			const response: any[] = canAccessWpcomApis()
				? await wpcomRequest( {
						method: 'GET',
						path: `/odie/conversations/${ botSlugs }?${ queryParams }`,
						apiNamespace: 'wpcom/v2',
				  } )
				: await apiFetch( {
						path: `/help-center/odie/conversations/${ botSlugs }?${ queryParams }`,
						method: 'GET',
				  } );

			return response.map( ( conversation: any ) => {
				const summary = conversation.first_message ?? conversation.last_message;
				return {
					id: String( conversation.chat_id ?? '' ),
					createdAt: getTimestamp( conversation.created_at ),
					messages: summary
						? [
								{
									received: getTimestamp( summary.created_at ),
									role: summary.role ?? 'bot',
									text: summary.content ?? '',
								},
						  ]
						: [],
				};
			} ) as OdieConversation[];
		},
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		enabled: enabled && supportInteractions?.length > 0,
		staleTime: 1000 * 30, // 30 seconds
	} );
};
