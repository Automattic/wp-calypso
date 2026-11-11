import { wpcom } from '../wpcom-fetcher';
import type {
	WordPressAgentSlackOauthResponse,
	WordPressAgentTelegramAuthPayload,
	WordPressAgentTelegramTokenPayload,
} from './types';

const slackApiPath = '/wordpress-agent/slack';

export async function startWordPressAgentSlackOauth(): Promise< WordPressAgentSlackOauthResponse > {
	return wpcom.req.post( {
		path: `${ slackApiPath }/oauth/start`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function pairWordPressAgentSlack( token: string ) {
	return wpcom.req.post(
		{
			path: `${ slackApiPath }/pair`,
			apiNamespace: 'wpcom/v2',
		},
		{ token }
	);
}

export async function disconnectWordPressAgentSlack( teamId: string ) {
	return wpcom.req.post( {
		path: `${ slackApiPath }/connections/${ encodeURIComponent( teamId ) }`,
		apiNamespace: 'wpcom/v2',
		method: 'DELETE',
	} );
}

export async function connectWordPressAgentTelegram( payload: WordPressAgentTelegramAuthPayload ) {
	return wpcom.req.post( { path: '/telegram-bot/connect', apiNamespace: 'wpcom/v2' }, payload );
}

export async function connectWordPressAgentTelegramViaToken(
	payload: WordPressAgentTelegramTokenPayload
) {
	return wpcom.req.post(
		{ path: '/telegram-bot/connect-via-token', apiNamespace: 'wpcom/v2' },
		payload
	);
}

export async function disconnectWordPressAgentTelegram() {
	return wpcom.req.post( {
		path: '/telegram-bot/disconnect',
		apiNamespace: 'wpcom/v2',
	} );
}
