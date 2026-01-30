import {
	loadAllMessagesFromServer,
	createOdieBotId,
	type Message,
} from '@automattic/agenttic-client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from '@wordpress/element';
import { API_BASE_URL } from '../constants';

interface Config {
	agentId: string;
	sessionId: string;
	authProvider?: () => Promise< Record< string, string > >;
	maxPages?: number;
	onSuccess?: ( messages: Message[], sessionId: string ) => void;
}

interface Result {
	data: { messages: Message[]; sessionId?: string } | undefined;
	isLoading: boolean;
	isError: boolean;
}

export default function useConversation( {
	agentId,
	sessionId,
	authProvider,
	maxPages = 10,
	onSuccess = () => {},
}: Config ): Result {
	// Keep refs to the latest callbacks
	const onSuccessRef = useRef( onSuccess );
	onSuccessRef.current = onSuccess;

	const { data, isLoading, isError, error } = useQuery( {
		// eslint-disable-next-line @tanstack/query/exhaustive-deps -- we only want to refetch when sessionId changes
		queryKey: [ 'agents-manager-conversation', sessionId ],
		queryFn: async () => {
			const urlSearchParams = new URLSearchParams( window.location.search );
			const hasAgentParam = urlSearchParams.has( 'agent' );
			const botId = hasAgentParam ? agentId : createOdieBotId( agentId );

			return await loadAllMessagesFromServer(
				sessionId,
				{
					botId,
					apiBaseUrl: API_BASE_URL,
					authProvider,
				},
				maxPages
			);
		},
		enabled: !! sessionId,
	} );

	useEffect(
		() => {
			if ( data ) {
				onSuccessRef.current( data.messages, data.sessionId || sessionId );
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to call onSuccess when data changes
		[ data ]
	);

	useEffect( () => {
		if ( error ) {
			// eslint-disable-next-line no-console
			console.error( '[useConversation] Error loading conversation:', error );
		}
	}, [ error ] );

	return { data, isLoading, isError };
}
