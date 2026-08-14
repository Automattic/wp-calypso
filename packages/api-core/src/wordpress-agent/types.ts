export interface WordPressAgentSlackConnection {
	team_id: string;
	team_name: string;
	slack_user_id: string;
	installed: boolean;
}

export interface WordPressAgentSlackConnectionsResponse {
	connections: WordPressAgentSlackConnection[];
}

export interface WordPressAgentSlackOauthResponse {
	authorize_url: string;
}

export interface WordPressAgentTelegramAuthPayload {
	id: number;
	first_name?: string;
	last_name?: string;
	username?: string;
	photo_url?: string;
	auth_date: number;
	hash: string;
}

export interface WordPressAgentTelegramStatus {
	connected?: boolean;
	telegram_user_id?: number | string;
}

export interface WordPressAgentTelegramTokenPayload {
	telegram_id: string;
	token: string;
	ts: string;
	bot?: string;
}
