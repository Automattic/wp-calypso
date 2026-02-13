import { type MarkdownComponents, type MarkdownExtensions } from '@automattic/agenttic-ui';
import { useManagedZendeskChat } from '@automattic/zendesk-client';
import { forwardRef, useImperativeHandle } from '@wordpress/element';
import AgentChat from '../agent-chat';
import { type Options as ChatHeaderOptions } from '../chat-header';
import type { Message } from '@automattic/agenttic-ui/dist/types';
import './style.scss';

interface Props {
	/** Chat header menu options. */
	chatHeaderOptions: ChatHeaderOptions;
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

export interface ZendeskChatHandle {
	/** Returns the number of messages in the current Zendesk conversation. */
	getMessagesCount: () => number;
}

function ZendeskChatInner(
	{
		chatHeaderOptions,
		isDocked,
		isOpen,
		onClose,
		onExpand,
		markdownComponents = {},
		markdownExtensions = {},
	}: Props,
	ref: React.ForwardedRef< ZendeskChatHandle >
) {
	const { agentticMessages, onSubmit, isLoadingConversation, isProcessing, onTypingStatusChange } =
		useManagedZendeskChat();

	// Expose imperative methods to parent component
	useImperativeHandle(
		ref,
		() => ( {
			getMessagesCount: () => agentticMessages.length,
		} ),
		[ agentticMessages.length ]
	);

	return (
		<AgentChat
			messages={ agentticMessages as Message[] }
			suggestions={ [] }
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

const ZendeskChat = forwardRef( ZendeskChatInner );
export default ZendeskChat;
