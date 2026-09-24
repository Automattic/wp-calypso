import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { SMOOCH_APP_ID, SMOOCH_APP_ID_STAGING, WIDGET_URL, WIDGET_URL_STAGING } from './constants';
import { fetchMessagingAuth } from './use-authenticate-zendesk-messaging';
import { convertZendeskMessages } from './use-get-zendesk-conversation';
import { isTestModeEnvironment } from './util';
import type { MessageAction, ZendeskMessage } from './types';

// Upper bound on older pages fetched per conversation, so a runaway `hasPrevious` can't loop forever.
const MAX_HISTORY_PAGES = 20;

type RawSunshineMessage = Omit< ZendeskMessage, 'id' | 'role' | 'displayName' | 'actions' > & {
	_id: string;
	role: 'appUser' | 'appMaker' | 'business';
	name?: string;
	authorId?: string;
	actions?: ( Omit< MessageAction, 'id' > & { _id: string } )[];
};

type SunshineMessagesPage = {
	messages?: RawSunshineMessage[];
	hasPrevious?: boolean;
};

export const getZendeskConversationHistoryQueryKey = ( conversationId: string, before: number ) => [
	'zendesk-conversation-history',
	conversationId,
	before,
];

/**
 * The REST API returns messages in their raw Sunshine shape. Map them to the shape
 * `Smooch.getConversationById` returns, the same way the Smooch SDK does internally.
 */
function toSmoochMessage( { _id, name, role, authorId, actions, ...rest }: RawSunshineMessage ) {
	const isUser = role === 'appUser';
	return {
		...rest,
		id: _id,
		displayName: name,
		role: isUser ? 'user' : 'business',
		...( isUser && authorId && { userId: authorId } ),
		...( actions?.length && {
			actions: actions.map( ( { _id: id, ...action } ) => ( { ...action, id } ) ),
		} ),
	} as ZendeskMessage;
}

/**
 * `Smooch.getConversationById` only returns the latest page of messages, and the SDK doesn't expose
 * a way to load the older ones. This fetches the pages before `before` from the Sunshine SDK API.
 */
export const useGetZendeskConversationHistory = () => {
	const queryClient = useQueryClient();

	return useCallback(
		( {
			conversationId,
			before,
			clientId,
		}: {
			conversationId: string;
			before: number;
			clientId?: string;
		} ) =>
			queryClient.fetchQuery( {
				queryKey: getZendeskConversationHistoryQueryKey( conversationId, before ),
				queryFn: async () => {
					const isTestMode = isTestModeEnvironment();
					const appId = isTestMode ? SMOOCH_APP_ID_STAGING : SMOOCH_APP_ID;
					const url = isTestMode ? WIDGET_URL_STAGING : WIDGET_URL;
					// Same query `useSmooch` authenticates with, so this is normally served from the cache.
					const auth = await queryClient.fetchQuery( {
						queryKey: [ 'getMessagingAuth', 'zendesk', isTestMode, false ],
						queryFn: () => fetchMessagingAuth( 'zendesk', false ),
						staleTime: 7 * 24 * 60 * 60 * 1000,
					} );

					let olderMessages: ZendeskMessage[] = [];
					let cursor = before;

					for ( let page = 0; page < MAX_HISTORY_PAGES; page++ ) {
						const response = await fetch(
							`${ url }/sc/sdk/v2/apps/${ appId }/conversations/${ conversationId }/messages?before=${ cursor }`,
							{
								credentials: 'include',
								headers: {
									Authorization: `Bearer ${ auth.jwt }`,
									'x-smooch-appid': appId,
									...( clientId && { 'x-smooch-clientid': clientId } ),
									'x-smooch-sdk': 'web/zendesk/0.1',
								},
							}
						);

						if ( ! response.ok ) {
							throw new Error( `Failed to fetch the conversation history: ${ response.status }` );
						}

						const { messages = [], hasPrevious }: SunshineMessagesPage = await response.json();
						olderMessages = [ ...messages.map( toSmoochMessage ), ...olderMessages ];

						if ( ! hasPrevious || ! messages.length ) {
							break;
						}
						cursor = messages[ 0 ].received;
					}

					return convertZendeskMessages( olderMessages );
				},
				staleTime: Infinity,
				meta: {
					persist: false,
				},
			} ),
		[ queryClient ]
	);
};
