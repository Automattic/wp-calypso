import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
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
	const slugs = encodeURIComponent(
		supportInteractions?.map( ( interaction ) => interaction.bot_slug ).join( ',' )
	);

	return useQuery< OdieConversation[], Error >( {
		queryKey: [ 'odie-interactions', slugs, version ],
		queryFn: async (): Promise< OdieConversation[] > => {
			const queryParams = new URLSearchParams( {
				page_number: '1',
				items_per_page: '30',
				truncation_method: 'first_message',
			} ).toString();

			const response: any[] = canAccessWpcomApis()
				? await wpcomRequest( {
						method: 'GET',
						path: `/odie/conversations/${ slugs }?${ queryParams }`,
						apiNamespace: 'wpcom/v2',
				  } )
				: await apiFetch( {
						path: `/help-center/odie/conversations/${ slugs }?${ queryParams }`,
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
