// Styles
import './styles/global.css';

// Main component exports - New composable API
export { AgentUI, default } from './components/AgentUI';

// Individual composable components
export { AgentUIContainer } from './components/AgentUIContainer';
export { AgentUIHeader } from './components/composable/AgentUIHeader';
export { AgentUIMessages } from './components/composable/AgentUIMessages';
export { AgentUIInput } from './components/composable/AgentUIInput';
export { AgentUISuggestions } from './components/composable/AgentUISuggestions';
export { AgentUINotice } from './components/composable/AgentUINotice';
export { AgentUIFooter } from './components/composable/AgentUIFooter';
export { AgentUIConversationView } from './components/composable/AgentUIConversationView';
export { AgentUIInputToolbar } from './components/composable/AgentUIInputToolbar';
export type { AgentUIInputToolbarProps } from './components/composable/AgentUIInputToolbar';

// Context for advanced usage
export { AgentUIProvider } from './context/AgentUIContext';
export { useAgentUIContext } from './context/AgentUIContext';
export type { AgentUIContextValue } from './context/AgentUIContext';

// Individual UI components for advanced composition
export { Chat } from './components/chat/Chat';
export { ChatFooter } from './components/chat/ChatFooter';
export { ChatInput } from './components/chat/ChatInput';
export { ImageUploader } from './components/chat/ImageUploader';
export type {
	UploadedImage,
	UploadingImage,
	ImageUploaderHandle,
} from './components/chat/ImageUploader';
export { ThinkingMessage } from './components/chat/ThinkingMessage';
export { Messages } from './components/chat/Messages';
export { MessageActions } from './components/chat/MessageActions';
export { MessageDivider } from './components/chat/MessageDivider';
export { Notice } from './components/chat/Notice';
export { Message } from './components/chat/Message';
export { Suggestions } from './components/chat/Suggestions';
export { AnimatedPlaceholder } from './components/chat/AnimatedPlaceholder';
export { ChatHeader } from './components/chat/ChatHeader';
export { EmptyView } from './components/chat/EmptyView';
export { CollapsedView } from './components/views/CollapsedView';
export { CompactView } from './components/views/CompactView';
export { ConversationView } from './components/views/ConversationView';
export { MinimizedView } from './components/views/MinimizedView';
export { ImageRenderer } from './components/chat/ImageRenderer';

// Hooks
export { useChat } from './hooks/useChat';
export { useInput } from './hooks/useInput';

// Utilities
export { cn } from './utils/classNames';
export * as animations from './components/animations';
export { ThumbsUpIcon } from './components/icons/ThumbsUpIcon';
export { ThumbsDownIcon } from './components/icons/ThumbsDownIcon';
export { CopyIcon } from './components/icons/CopyIcon';
export { StylesIcon } from './components/icons/StylesIcon';
export { BigSkyIcon } from './components/icons/BigSkyIcon';
export { AssistantAvatarIcon } from './components/icons/AssistantAvatarIcon';
export { StopIcon } from './components/icons/StopIcon';
export { XIcon } from './components/icons/XIcon';
export { ArrowUpIcon } from './components/icons/ArrowUpIcon';
export { ChevronUpIcon } from './components/icons/ChevronUpIcon';
export { ZoomIcon } from './components/icons/ZoomIcon';
export { ZoomIconFilled } from './components/icons/ZoomIconFilled';
export { RegenerateIcon } from './components/icons/RegenerateIcon';
export { RegenerateAltIcon } from './components/icons/RegenerateAltIcon';
export { PlusIcon } from './components/icons/PlusIcon';
export { AltIcon } from './components/icons/AltIcon';
export { BlurIcon } from './components/icons/BlurIcon';

// Types
export type * from './types';

// Message rendering utilities
export { createMessageRenderer } from './utils/createMessageRenderer';
export type { MarkdownComponents } from './utils/createMessageRenderer';
export { loadAgentticTranslations } from './utils/translation-loader';

// Message actions utilities
export { createFeedbackActions } from './message-actions/utils';
export type {
	FeedbackActionsConfig,
	FeedbackActionsManager,
} from './message-actions/utils';

// Markdown extensions - Chart components
export { BarChart, LineChart, ChartBlock } from './markdown-extensions/charts';
export type {
	MarkdownExtensions,
	ChartExtensionConfig,
	ChartData,
	ChartSeries,
} from './markdown-extensions/types';
