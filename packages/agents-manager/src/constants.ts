export const API_BASE_URL = 'https://public-api.wordpress.com';

export const ORCHESTRATOR_AGENT_URL = `${ API_BASE_URL }/wpcom/v2/ai/agent`;
export const ORCHESTRATOR_AGENT_ID = 'wp-orchestrator';
export const UNIFIED_CHAT_AGENT_ID = 'wpcom-workflow-unified_chat';

export const LOCAL_TOOL_RUNNING_MESSAGE = 'local_tool_running';

// `agenttic-ui` reads this key ahead of `initialChatPosition` when seeding the
// panel side. Keep in sync with `STORAGE_KEY` in its `chatStorage.ts`.
export const AGENTTIC_CHAT_POSITION_STORAGE_KEY = 'agenttic-chat-position';

// Free-drag seed `agenttic-ui` clamps into the viewport — lands the panel at the right corner.
export const FLOATING_RIGHT_CORNER_SEED = Object.freeze( { x: Number.MAX_SAFE_INTEGER, y: 0 } );
