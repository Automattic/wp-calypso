import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { ODIE_DEFAULT_BOT_SLUG_LEGACY } from '../constants';
import { useOdieAssistantContext } from '../context';
import { generateUUID } from '../utils';
import { useCurrentSupportInteraction } from './use-current-support-interaction';
import type { OdieChat, ReturnedChat } from '../types';

/**
 * Get the ODIE chat and manage the cache to save on API calls.
 * @param chatId - The chat ID to fetch
 */
export const useOdieChat = ( chatId: number | null ) => {
	const { version } = useOdieAssistantContext();
	const { data: supportInteraction } = useCurrentSupportInteraction();

	// Hover `ODIE_DEFAULT_BOT_SLUG_LEGACY` for more information.
	const botSlug = supportInteraction?.bot_slug || ODIE_DEFAULT_BOT_SLUG_LEGACY;

	return useQuery< OdieChat, Error >( {
		queryKey: [ 'odie-chat', botSlug, chatId, version ],
		queryFn: async (): Promise< OdieChat > => {
			const queryParams = new URLSearchParams( {
				page_number: '1',
				items_per_page: '30',
				include_feedback: 'true',
				...( version && { version } ),
			} ).toString();

			const data = (
				canAccessWpcomApis()
					? await wpcomRequest( {
							method: 'GET',
							path: `/odie/chat/${ botSlug }/${ chatId }?${ queryParams }`,
							apiNamespace: 'wpcom/v2',
					  } )
					: await apiFetch( {
							path: `/help-center/odie/chat/${ botSlug }/${ chatId }?${ queryParams }`,
							method: 'GET',
					  } )
			) as ReturnedChat;

			return {
				messages: ( data.messages || [] ).map( ( message ) => ( {
					...message,
					internal_message_id: generateUUID(),
				} ) ),
				odieId: Number( data.chat_id ) || chatId,
				wpcomUserId: data.wpcom_user_id,
			};
		},
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		enabled: !! chatId && !! supportInteraction,
		staleTime: 3600, // 1 hour
	} );
};
