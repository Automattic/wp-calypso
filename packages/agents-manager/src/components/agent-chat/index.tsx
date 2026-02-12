import { SubmitOptions } from '@automattic/agenttic-client';
import {
	AgentUI,
	createMessageRenderer,
	EmptyView,
	ImageUploader,
	type MarkdownComponents,
	type MarkdownExtensions,
	type Suggestion,
	type ChatState,
} from '@automattic/agenttic-ui';
import { useDispatch, useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { AGENTS_MANAGER_STORE } from '../../stores';
import ChatHeader, { type Options as ChatHeaderOptions } from '../chat-header';
import ChatMessageSkeleton from '../chat-message-skeleton';
import { AI } from '../icons';
import SelectedBlock from '../selected-block';
import type { UseImageUploadResult } from '../../utils/load-external-providers';
import type { Message } from '@automattic/agenttic-ui/dist/types';
import type { AgentsManagerSelect } from '@automattic/data-stores';

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
	onSubmit: ( message: string, options?: SubmitOptions ) => Promise< void > | void;
	/** Called when the user aborts the current request. */
	onAbort: () => void;
	/** Called when the chat is closed. */
	onClose: () => void;
	/** Called when the chat is expanded (floating mode). */
	onExpand: () => void;
	/** Called to clear the suggestions. */
	clearSuggestions?: () => void;
	/** Called when the typing status changes. */
	onTypingStatusChange?: ( isTyping: boolean ) => void;
	/** Custom components for rendering markdown. */
	markdownComponents?: MarkdownComponents;
	/** Custom markdown extensions. */
	markdownExtensions?: MarkdownExtensions;
	/** Controlled input value for tracking text in the input field. */
	inputValue?: string;
	/** Called when the input value changes. */
	onInputChange?: ( value: string ) => void;
	/** Whether to render the floating chat in compact mode. */
	isCompactMode?: boolean;
	/** Image upload state from the parent component. When provided, enables the image uploader UI. */
	imageUpload?: UseImageUploadResult;
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
	clearSuggestions,
	markdownComponents = {},
	markdownExtensions = {},
	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Kept for API compatibility with ZendeskChat
	onTypingStatusChange,
	inputValue,
	onInputChange,
	isCompactMode = false,
	imageUpload,
}: AgentChatProps ) {
	const { setFloatingPosition } = useDispatch( AGENTS_MANAGER_STORE );
	const { floatingPosition } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	const messageRenderer = useMemo(
		() =>
			createMessageRenderer( {
				components: markdownComponents,
				extensions: markdownExtensions,
			} ),
		[ markdownComponents, markdownExtensions ]
	);

	let floatingChatState: ChatState = 'collapsed';
	if ( isOpen ) {
		floatingChatState = 'expanded';
	} else if ( isCompactMode ) {
		floatingChatState = 'compact';
	}

	return (
		<AgentUI.Container
			initialChatPosition={ floatingPosition }
			onChatPositionChange={ ( position ) => setFloatingPosition( position ) }
			className={ clsx( 'agenttic', { dark: isDocked } ) }
			messages={ messages }
			isProcessing={ isProcessing }
			error={ error }
			onSubmit={ onSubmit }
			variant={ isDocked ? 'embedded' : 'floating' }
			suggestions={ suggestions }
			clearSuggestions={ clearSuggestions }
			floatingChatState={ floatingChatState }
			onClose={ onClose }
			onExpand={ onExpand }
			onStop={ onAbort }
			messageRenderer={ messageRenderer }
			inputValue={ inputValue }
			onInputChange={ onInputChange }
			emptyView={
				isLoadingConversation ? (
					<ChatMessageSkeleton count={ 3 } />
				) : (
					<EmptyView
						heading={ __( 'Howdy! How can I help you today?', '__i18n_text_domain__' ) }
						help={
							emptyViewSuggestions.length > 0
								? __( 'Got a different request? Ask away.', '__i18n_text_domain__' )
								: undefined
						}
						suggestions={ emptyViewSuggestions }
						icon={ isDocked ? <AI /> : <AI size={ 41 } color="#3858e8" /> }
					/>
				)
			}
		>
			<AgentUI.ConversationView>
				<ChatHeader isChatDocked={ isDocked } onClose={ onClose } options={ chatHeaderOptions } />
				{ isLoadingConversation ? <ChatMessageSkeleton count={ 3 } /> : <AgentUI.Messages /> }
				<AgentUI.Footer>
					<AgentUI.Suggestions />
					<AgentUI.Notice />
					{ imageUpload && (
						<ImageUploader
							images={ imageUpload.pendingImages }
							uploadingImages={ imageUpload.uploadingImages }
							onFilesSelected={ imageUpload.handleFilesSelected }
							onRemoveImage={ imageUpload.handleRemoveImage }
							acceptedFileTypes={ [
								'image/jpeg',
								'image/png',
								'image/heic',
								'image/heif',
								'image/heic-sequence',
								'image/heif-sequence',
							] }
							showFileMetadata
							allowDragToInsert={ false }
						/>
					) }

					<SelectedBlock />
					<AgentUI.Input />
				</AgentUI.Footer>
			</AgentUI.ConversationView>
		</AgentUI.Container>
	);
}
