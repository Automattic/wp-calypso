// Main chat component export
export { Chat } from './Chat';

// Individual component exports
export { Message as ChatMessage } from './Message';
export { Messages } from './Messages';
export { ThinkingMessage } from './ThinkingMessage';
export { ChatInput } from './ChatInput';

// View components
export { CollapsedView } from '../views/CollapsedView';
export { CompactView } from '../views/CompactView';
export { ConversationView } from '../views/ConversationView';

// Hook exports
export { useChat } from '../../hooks/useChat';
export { useInput } from '../../hooks/useInput';

// Type exports
export type {
	ChatProps,
	ChatState,
	Message,
	UseChatReturn,
	UseInputReturn,
} from '../../types';

// Animation exports
export * from '../animations';
