import { MarkdownComponents, MarkdownExtensions, Suggestion } from '@automattic/agenttic-ui';
import { useManagedZendeskChat } from '@automattic/zendesk-client';
import AgentChat from '../agent-chat';
import { type Options as ChatHeaderOptions } from '../chat-header';
import './style.scss';

interface AgentChatProps {
	/** Suggestions to show in the chat input. */
	suggestions: Suggestion[];
	/** Error message to display, if any. */
	error?: string | null;
	/** Chat header menu options. */
	chatHeaderOptions: ChatHeaderOptions;
	/** Suggestions displayed when the chat is empty. */
	emptyViewSuggestions?: Suggestion[];
	/** Indicates if the chat is processing a request. */
	isProcessing: boolean;
	/** Indicates if a conversation is being loaded. */
	isLoadingConversation: boolean;
	/** Indicates if the chat is docked in the sidebar. */
	isDocked: boolean;
	/** Indicates if the chat is expanded (floating mode). */
	isOpen: boolean;
	/** Called when the chat is closed. */
	onClose: () => void;
	/** Called when the chat is expanded (floating mode). */
	onExpand: () => void;
	/** Custom components for rendering markdown. */
	markdownComponents?: MarkdownComponents;
	/** Custom markdown extensions. */
	markdownExtensions?: MarkdownExtensions;
}

export function ZendeskChat( {
	suggestions,
	error = null,
	chatHeaderOptions,
	emptyViewSuggestions = [],
	isProcessing,
	isLoadingConversation,
	isDocked,
	isOpen,
	onClose,
	onExpand,
	markdownComponents = {},
	markdownExtensions = {},
}: AgentChatProps ) {
	const { agentticMessages, onSubmit } = useManagedZendeskChat( true );

	return (
		<AgentChat
			messages={ agentticMessages as any }
			suggestions={ [] }
			emptyViewSuggestions={ suggestions.length ? suggestions : emptyViewSuggestions }
			isProcessing={ isProcessing }
			error={ error }
			onSubmit={ onSubmit }
			isLoadingConversation={ isLoadingConversation }
			isDocked={ isDocked }
			onAbort={ () => {} }
			isOpen={ isOpen }
			onClose={ onClose }
			onExpand={ onExpand }
			chatHeaderOptions={ chatHeaderOptions }
			markdownComponents={ markdownComponents }
			markdownExtensions={ markdownExtensions }
		/>
	);
}
