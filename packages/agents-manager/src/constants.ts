export const API_BASE_URL = 'https://public-api.wordpress.com';

export const ORCHESTRATOR_AGENT_URL = `${ API_BASE_URL }/wpcom/v2/ai/agent`;
export const ORCHESTRATOR_AGENT_ID = 'wp-orchestrator';
export const DOLLY_AGENT_ID = 'dolly';
export const LOCAL_TOOL_RUNNING_MESSAGE = 'local_tool_running';

/** Route-state origin marker for views opened from the chat (e.g. the post view). */
export const FROM_CHAT = 'chat';

/** The file types the chat composer accepts. */
export const DEFAULT_ACCEPTED_UPLOAD_TYPES = [
	'image/jpeg',
	'image/png',
	'image/heic',
	'image/heif',
	'image/heic-sequence',
	'image/heif-sequence',
];
