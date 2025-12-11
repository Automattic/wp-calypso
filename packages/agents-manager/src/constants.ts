export const API_BASE_URL = 'https://public-api.wordpress.com';

export const ORCHESTRATOR_AGENT_URL = `${ API_BASE_URL }/wpcom/v2/ai/agent`;
export const ORCHESTRATOR_AGENT_ID = 'wp-orchestrator';

export const ODIE_DEFAULT_BOT_SLUG_LEGACY = 'wpcom-support-chat';
export const ODIE_ALLOWED_BOTS = [
	ODIE_DEFAULT_BOT_SLUG_LEGACY,
	'wpcom-plan-support',
	'wpcom-workflow-support_chat',
	'automattic-chat-support_a4a',
] as const;
