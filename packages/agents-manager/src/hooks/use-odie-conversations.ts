import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { useEffect } from '@wordpress/element';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { ODIE_DEFAULT_BOT_SLUG_LEGACY } from '../constants';
import getTimestamp from '../utils/get-timestamp';
import useGetSupportInteractions from './use-get-support-interactions';

interface Message {
	received: number;
	role: string;
	text: string;
}

interface Conversation {
	id: string;
	createdAt: number;
	messages: Message[];
}

interface Result {
	conversations: Conversation[];
	isLoading: boolean;
	isError: boolean;
}

export default function useOdieConversations(): Result {
	const { data: supportInteractions = [], isLoading: isLoadingInteractions } =
		useGetSupportInteractions( 'odie' );

	const botSlugs = Array.from(
		new Set(
			supportInteractions.map( ( interaction ) => {
				// Hover `ODIE_DEFAULT_BOT_SLUG_LEGACY` for more information.
				return interaction.bot_slug || ODIE_DEFAULT_BOT_SLUG_LEGACY;
			} )
		)
	).join( ',' );

	const {
		data: conversations,
		isLoading: isLoadingConversations,
		isError,
		error,
	} = useQuery< Conversation[], Error >( {
		queryKey: [ 'agents-manager-odie-conversations', botSlugs ],
		queryFn: async (): Promise< Conversation[] > => {
			const queryParams = new URLSearchParams( {
				page_number: '1',
				items_per_page: '30',
				truncation_method: 'first_message',
			} ).toString();

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

			return response.map( ( conversation ) => {
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
			} );
		},
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		enabled: supportInteractions.length > 0,
		staleTime: 1000 * 30, // 30 seconds
	} );

	useEffect( () => {
		if ( error ) {
			// eslint-disable-next-line no-console
			console.error( '[useOdieConversations] Error loading conversation list:', error );
		}
	}, [ error ] );

	return {
		conversations: conversations || [],
		isLoading: isLoadingInteractions || isLoadingConversations,
		isError,
	};
}
