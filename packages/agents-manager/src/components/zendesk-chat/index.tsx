import {
	type MarkdownComponents,
	type MarkdownExtensions,
	type Suggestion,
} from '@automattic/agenttic-ui';
import { useManagedZendeskChat } from '@automattic/zendesk-client';
import AgentChat from '../agent-chat';
import { type Options as ChatHeaderOptions } from '../chat-header';
import type { Message } from '@automattic/agenttic-ui/dist/types';
import './style.scss';

interface ZendeskChatProps {
	/** Suggestions to show in the chat input. */
	suggestions?: Suggestion[];
	/** Chat header menu options. */
	chatHeaderOptions: ChatHeaderOptions;
	/** Suggestions displayed when the chat is empty. */
	emptyViewSuggestions?: Suggestion[];
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
	suggestions = [],
	chatHeaderOptions,
	emptyViewSuggestions = [],
	isDocked,
	isOpen,
	onClose,
	onExpand,
	markdownComponents = {},
	markdownExtensions = {},
}: ZendeskChatProps ) {
	const { agentticMessages, onSubmit, isLoadingConversation, isProcessing, onTypingStatusChange } =
		useManagedZendeskChat( true );

	return (
		<AgentChat
			messages={ agentticMessages as Message[] }
			suggestions={ suggestions }
			emptyViewSuggestions={ suggestions.length ? suggestions : emptyViewSuggestions }
			isProcessing={ isProcessing }
			error={ null }
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
			onTypingStatusChange={ onTypingStatusChange }
		/>
	);
}
