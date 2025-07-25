// Styles
import './styles/global.css';

// Main component exports
export { AgentUI } from './components/AgentUI';

// Individual UI components for advanced composition
export { Chat } from './components/chat/Chat';
export { ChatInput } from './components/chat/ChatInput';
export { Messages } from './components/chat/Messages';
export { Message } from './components/chat/Message';
export { Suggestions } from './components/chat/Suggestions';

// NOTE: AgentChat has been removed - use AgentUI with useAgentChat hook from @automattic/agenttic-client

// Hooks - removed useMarkdown and useSuggestions as they depend on AgentProvider context
// Use the methods from useAgentChat hook directly instead

// Chart components moved to @automattic/agenttic-client

// Types
export type * from './types';
