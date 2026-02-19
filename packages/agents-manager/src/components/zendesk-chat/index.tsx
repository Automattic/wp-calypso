import { type MarkdownComponents, type MarkdownExtensions } from '@automattic/agenttic-ui';
import { useManagedZendeskChat } from '@automattic/zendesk-client';
import { useEffect } from '@wordpress/element';
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
	/** Called when the message count changes. */
	onMessagesCountChange: ( count: number ) => void;
}

export default function ZendeskChat( {
	chatHeaderOptions,
	isDocked,
	isOpen,
	onClose,
	onExpand,
	markdownComponents = {},
	markdownExtensions = {},
	onMessagesCountChange,
}: Props ) {
	const { agentticMessages, onSubmit, isLoadingConversation, isProcessing, onTypingStatusChange } =
		useManagedZendeskChat();

	// Notify parent when message count changes
	useEffect( () => {
		onMessagesCountChange( agentticMessages.length );
	}, [ agentticMessages.length, onMessagesCountChange ] );

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
