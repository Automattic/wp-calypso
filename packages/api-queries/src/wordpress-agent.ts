import {
	disconnectWordPressAgentSlack,
	disconnectWordPressAgentTelegram,
	fetchWordPressAgentSlackConnections,
	fetchWordPressAgentTelegramStatus,
	pairWordPressAgentSlack,
	startWordPressAgentSlackOauth,
	connectWordPressAgentTelegram,
	connectWordPressAgentTelegramViaToken,
} from '@automattic/api-core';
import { mutationOptions, queryOptions, type QueryClient } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const wordpressAgentSlackConnectionsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'wordpress-agent', 'slack', 'connections' ],
		queryFn: fetchWordPressAgentSlackConnections,
	} );

export const wordpressAgentSlackOauthMutation = () =>
	mutationOptions( {
		meta: { statId: 'wp-agent-slack-install' },
		mutationFn: startWordPressAgentSlackOauth,
	} );

export const wordpressAgentSlackPairMutation = ( client: QueryClient = queryClient ) =>
	mutationOptions( {
		meta: { statId: 'wp-agent-slack-pair' },
		mutationFn: pairWordPressAgentSlack,
		onSuccess: () => client.invalidateQueries( wordpressAgentSlackConnectionsQuery() ),
	} );

export const wordpressAgentSlackDisconnectMutation = ( client: QueryClient = queryClient ) =>
	mutationOptions( {
		meta: { statId: 'wp-agent-slack-disconnect' },
		mutationFn: disconnectWordPressAgentSlack,
		onSuccess: () => client.invalidateQueries( wordpressAgentSlackConnectionsQuery() ),
	} );

export const wordpressAgentTelegramStatusQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'wordpress-agent', 'telegram', 'status' ],
		queryFn: fetchWordPressAgentTelegramStatus,
	} );

export const wordpressAgentTelegramConnectMutation = ( client: QueryClient = queryClient ) =>
	mutationOptions( {
		meta: { statId: 'wp-agent-tg-connect' },
		mutationFn: connectWordPressAgentTelegram,
		onSuccess: () =>
			client.setQueryData( wordpressAgentTelegramStatusQuery().queryKey, { connected: true } ),
	} );

export const wordpressAgentTelegramTokenConnectMutation = ( client: QueryClient = queryClient ) =>
	mutationOptions( {
		meta: { statId: 'wp-agent-tg-token-connect' },
		mutationFn: connectWordPressAgentTelegramViaToken,
		onSuccess: () =>
			client.setQueryData( wordpressAgentTelegramStatusQuery().queryKey, { connected: true } ),
	} );

export const wordpressAgentTelegramDisconnectMutation = ( client: QueryClient = queryClient ) =>
	mutationOptions( {
		meta: { statId: 'wp-agent-tg-disconnect' },
		mutationFn: disconnectWordPressAgentTelegram,
		onSuccess: () =>
			client.setQueryData( wordpressAgentTelegramStatusQuery().queryKey, { connected: false } ),
	} );
