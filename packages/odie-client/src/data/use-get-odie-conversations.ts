import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { useI18n } from '@wordpress/react-i18n';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { useOdieAssistantContext } from '../context';
import { getTimestamp } from '../utils';
import type { OdieConversation } from '../types';

/**
 * Retrieves the list of conversations handled by AI.
 */
export const useGetOdieConversations = ( enabled = true ) => {
	const { __ } = useI18n();
	const { botNameSlug, version } = useOdieAssistantContext();

	return useQuery< OdieConversation[], Error >( {
		queryKey: [ 'odie-interactions', botNameSlug, version ],
		queryFn: async (): Promise< OdieConversation[] > => {
			const queryParams = new URLSearchParams( {
				page_number: '1',
				items_per_page: '30',
			} ).toString();

			const response: any[] = canAccessWpcomApis()
				? await wpcomRequest( {
						method: 'GET',
						path: `/odie/conversations/${ botNameSlug }?${ queryParams }`,
						apiNamespace: 'wpcom/v2',
				  } )
				: await apiFetch( {
						path: `/help-center/odie/conversations/${ botNameSlug }?${ queryParams }`,
						method: 'GET',
				  } );

			return response.map( ( conversation: any ) => ( {
				id: String( conversation.chat_id ?? '' ),
				createdAt: getTimestamp( conversation.created_at ),
				messages: conversation.last_message
					? [
							{
								displayName: __( 'Support Assistant', __i18n_text_domain__ ),
								received: getTimestamp( conversation.last_message.created_at ),
								role: conversation.last_message.role ?? 'bot',
								text: conversation.last_message.content ?? '',
							},
					  ]
					: [],
			} ) ) as OdieConversation[];
		},
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		enabled,
		staleTime: 1000 * 30, // 30 seconds
	} );
};
