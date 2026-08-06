export const API_BASE_URL = 'https://public-api.wordpress.com';

export const ORCHESTRATOR_AGENT_URL = `${ API_BASE_URL }/wpcom/v2/ai/agent`;
export const ORCHESTRATOR_AGENT_ID = 'wp-orchestrator';
export const UNIFIED_CHAT_AGENT_ID = 'wpcom-workflow-unified_chat';

export const LOCAL_TOOL_RUNNING_MESSAGE = 'local_tool_running';

// `agenttic-ui` persists the floating panel side under this key and reads it
// ahead of the `initialChatPosition` prop. Keep in sync with `STORAGE_KEY` in
// `agenttic-ui/src/utils/chatStorage.ts`.
export const AGENTTIC_CHAT_POSITION_STORAGE_KEY = 'agenttic-chat-position';

// Free-drag seed far past the right edge — `agenttic-ui` clamps it into the
// inset viewport, landing the floating panel exactly at the right corner.
export const FLOATING_RIGHT_CORNER_SEED = Object.freeze( { x: Number.MAX_SAFE_INTEGER, y: 0 } );
