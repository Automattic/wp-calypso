import { wpcom } from '../wpcom-fetcher';
import type {
	WordPressAgentSlackConnection,
	WordPressAgentSlackConnectionsResponse,
	WordPressAgentTelegramStatus,
} from './types';

const slackApiPath = '/wordpress-agent/slack';

export async function fetchWordPressAgentSlackConnections(): Promise<
	WordPressAgentSlackConnection[]
> {
	const response = await wpcom.req.get< WordPressAgentSlackConnectionsResponse >( {
		path: `${ slackApiPath }/connections`,
		apiNamespace: 'wpcom/v2',
	} );

	return response.connections;
}

export async function fetchWordPressAgentTelegramStatus(): Promise< WordPressAgentTelegramStatus > {
	return wpcom.req.get( {
		path: '/telegram-bot/status',
		apiNamespace: 'wpcom/v2',
	} );
}
