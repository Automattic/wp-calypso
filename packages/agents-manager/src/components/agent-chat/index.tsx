/**
 * Agent Chat Component
 *
 * Renders the main chat interface with conversation view.
 */

import {
	AgentUI,
	createMessageRenderer,
	type MarkdownComponents,
	type MarkdownExtensions,
	type Suggestion,
} from '@automattic/agenttic-ui';
import { Button } from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import { useNavigate } from 'react-router-dom';
import ChatHeader, { type Options as ChatHeaderOptions } from '../chat-header';
import ChatMessageSkeleton from '../chat-message-skeleton';
import CustomEmptyView from '../empty-view';
import type { Message } from '@automattic/agenttic-ui/dist/types';

interface AgentChatProps {
	/** Chat messages to display. */
	messages: Message[];
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
	/** Called when the user submits a message. */
	onSubmit: ( message: string ) => void;
	/** Called when the user aborts the current request. */
	onAbort: () => void;
	/** Called when the chat is closed. */
	onClose: () => void;
	/** Called when the chat is expanded (floating mode). */
	onExpand: () => void;
	/** Custom components for rendering markdown. */
	markdownComponents?: MarkdownComponents;
	/** Custom markdown extensions. */
	markdownExtensions?: MarkdownExtensions;
}

export default function AgentChat( {
	messages,
	suggestions,
	error = null,
	chatHeaderOptions,
	emptyViewSuggestions = [],
	isProcessing,
	isLoadingConversation,
	isDocked,
	isOpen,
	onSubmit,
	onAbort,
	onClose,
	onExpand,
	markdownComponents = {},
	markdownExtensions = {},
}: AgentChatProps ) {
	const messageRenderer = useMemo(
		() =>
			createMessageRenderer( {
				components: markdownComponents,
				extensions: markdownExtensions,
			} ),
		[ markdownComponents, markdownExtensions ]
	);
	const navigate = useNavigate();

	return (
		<AgentUI.Container
			className="agenttic"
			messages={ messages }
			isProcessing={ isProcessing }
			error={ error }
			onSubmit={ onSubmit }
			variant={ isDocked ? 'embedded' : 'floating' }
			suggestions={ suggestions }
			floatingChatState={ isOpen ? 'expanded' : 'collapsed' }
			onClose={ onClose }
			onExpand={ onExpand }
			onStop={ onAbort }
			messageRenderer={ messageRenderer }
			emptyView={
				isLoadingConversation ? (
					<ChatMessageSkeleton count={ 3 } />
				) : (
					<CustomEmptyView isDocked={ isDocked } emptyViewSuggestions={ emptyViewSuggestions } />
				)
			}
		>
			<AgentUI.ConversationView>
				<ChatHeader isChatDocked={ isDocked } onClose={ onClose } options={ chatHeaderOptions } />

				{ isLoadingConversation ? <ChatMessageSkeleton count={ 3 } /> : <AgentUI.Messages /> }
				<AgentUI.Footer>
					<Button variant="link" onClick={ () => navigate( -1 ) }>
						Back
					</Button>
					<AgentUI.Suggestions />
					<AgentUI.Notice />
					<AgentUI.Input />
				</AgentUI.Footer>
			</AgentUI.ConversationView>
		</AgentUI.Container>
	);
}
