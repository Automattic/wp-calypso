import { type MarkdownComponents, type MarkdownExtensions } from '@automattic/agenttic-ui';
import { useManagedZendeskChat } from '@automattic/zendesk-client';
import AgentChat from '../agent-chat';
import { type Options as ChatHeaderOptions } from '../chat-header';
import ConcludedConversationFooter from '../concluded-conversation-footer';
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

export default function ZendeskChat( {
	chatHeaderOptions,
	isDocked,
	isOpen,
	onClose,
	onExpand,
	markdownComponents = {},
	markdownExtensions = {},
}: Props ) {
	const {
		agentticMessages,
		onSubmit,
		isLoadingConversation,
		isProcessing,
		onTypingStatusChange,
		imageUpload,
		supportedImageTypes,
		notice,
		hasInteractionEnded,
	} = useManagedZendeskChat();

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
			notice={ notice }
			onExpand={ onExpand }
			chatHeaderOptions={ chatHeaderOptions }
			markdownComponents={ markdownComponents }
			markdownExtensions={ markdownExtensions }
			onTypingStatusChange={ onTypingStatusChange }
			imageUpload={ imageUpload }
			acceptedImageFileTypes={ supportedImageTypes }
			alternativeFooter={ hasInteractionEnded ? <ConcludedConversationFooter /> : undefined }
		/>
	);
}
