import { SubmitOptions } from '@automattic/agenttic-client';
import {
	AgentUI,
	createMessageRenderer,
	EmptyView,
	ImageUploader,
	type ImageUploaderHandle,
	type MarkdownComponents,
	type MarkdownExtensions,
	type Suggestion,
	type ChatState,
} from '@automattic/agenttic-ui';
import { useDispatch, useSelect } from '@wordpress/data';
import { useMemo, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { isPluginCompassHost } from '../../utils/is-plugin-compass-agent';
import { isReaderChatHost } from '../../utils/is-reader-chat-agent';
import ChatHeader, { type Options as ChatHeaderOptions } from '../chat-header';
import ChatMessageSkeleton from '../chat-message-skeleton';
import ContextCards from '../context-cards';
import CustomALink from '../custom-a-link';
import FeedbackInput from '../feedback-input';
import { AI } from '../icons';
import SelectedBlock from '../selected-block';
import type { UseImageUploadResult } from '../../hooks/use-image-upload';
import type { ExternalContextCard, ExternalContextCardAction } from '../../utils/external-context';
import type { Message, NoticeConfig } from '@automattic/agenttic-ui/dist/types';
import type { AgentsManagerSelect } from '@automattic/data-stores';

interface Props {
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
	/** Custom thinking message to display while the agent is processing. */
	thinkingMessage?: string | null;
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
	/** Called when a suggestion is clicked. */
	onSuggestionClick?: (
		selectedSuggestion: Suggestion,
		availableSuggestions: Suggestion[]
	) => void;
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
	/** Notice to display in the chat. */
	notice?: NoticeConfig;
	/** Indicates if the floating chat is in compact mode. */
	isCompactMode?: boolean;
	/** Image upload state from the parent component. When provided, enables the image uploader UI. */
	imageUpload?: UseImageUploadResult;
	/** Optional list of MIME types accepted for image uploads. When not provided, defaults include HEIC/HEIF. */
	acceptedImageFileTypes?: string[];
	/** Whether to show the feedback text input (after thumbs down). */
	showFeedbackInput?: boolean;
	/** Called when the user submits feedback text. */
	onSubmitFeedbackText?: ( feedbackText: string ) => Promise< void >;
	/** Called when the user cancels the feedback input. */
	onCancelFeedback?: () => void;
	/** Alternative footer to render instead of the default footer. */
	alternativeFooter?: React.ReactNode;
	/** Called when a context card action button is clicked. */
	onContextCardAction?: ( card: ExternalContextCard, action: ExternalContextCardAction ) => void;
	/** Called when a context card's dismiss button is clicked. */
	onContextCardDismiss?: ( card: ExternalContextCard ) => void;
}

const DEFAULT_ACCEPTED_IMAGE_TYPES = [
	'image/jpeg',
	'image/png',
	'image/heic',
	'image/heif',
	'image/heic-sequence',
	'image/heif-sequence',
];

/**
 * Read a string override from `window.agentsManagerData[key]`. Embedded
 * hosts (reader-chat on blog frontends, Plugin Compass on Calypso's plugins
 * marketplace) can customize the empty-view greeting/help copy by setting
 * these keys before AgentsManager mounts.
 */
function readAgentsManagerDataString(
	key: 'emptyViewHeading' | 'emptyViewHelp'
): string | undefined {
	if ( typeof window === 'undefined' ) {
		return undefined;
	}

	if ( ! isReaderChatHost() && ! isPluginCompassHost() ) {
		return undefined;
	}

	const data = ( window as unknown as { agentsManagerData?: Record< string, unknown > } )
		.agentsManagerData;
	const value = data?.[ key ];
	return typeof value === 'string' ? value : undefined;
}

/**
 * Returns the empty-view greeting. Priority:
 *   1. Explicit host override via `window.agentsManagerData.emptyViewHeading`.
 *   2. Reader-chat default (contextual to blog frontends).
 *   3. Orchestrator default.
 */
function getEmptyViewHeading(): string {
	const override = readAgentsManagerDataString( 'emptyViewHeading' );
	if ( override ) {
		return override;
	}
	if ( isReaderChatHost() ) {
		return __( 'Ask me anything about this blog.', '__i18n_text_domain__' );
	}
	return __( 'Howdy! How can I help you today?', '__i18n_text_domain__' );
}

function getEmptyViewHelp(): string {
	const override = readAgentsManagerDataString( 'emptyViewHelp' );
	if ( override ) {
		return override;
	}
	if ( isReaderChatHost() ) {
		return __( 'Or type your own question below.', '__i18n_text_domain__' );
	}
	return __( 'Got a different request? Ask away.', '__i18n_text_domain__' );
}

export default function AgentChat( {
	messages,
	suggestions,
	error = null,
	chatHeaderOptions,
	emptyViewSuggestions = [],
	isProcessing,
	thinkingMessage,
	isLoadingConversation,
	isDocked,
	isOpen,
	onSubmit,
	onAbort,
	onClose,
	onExpand,
	clearSuggestions,
	onSuggestionClick,
	notice,
	markdownComponents = {},
	markdownExtensions = {},
	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Kept for API compatibility with `ZendeskChat`
	onTypingStatusChange,
	inputValue,
	onInputChange,
	isCompactMode = false,
	imageUpload,
	acceptedImageFileTypes = DEFAULT_ACCEPTED_IMAGE_TYPES,
	showFeedbackInput = false,
	onSubmitFeedbackText = () => Promise.resolve(),
	onCancelFeedback = () => {},
	alternativeFooter,
	onContextCardAction,
	onContextCardDismiss,
}: Props ) {
	const { setFloatingPosition } = useDispatch( AGENTS_MANAGER_STORE );
	const conversationViewRef = useRef< HTMLDivElement >( null );
	const imageUploaderRef = useRef< ImageUploaderHandle >( null );
	const { floatingPosition } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	const mergedComponents = useMemo(
		() => ( { a: CustomALink, ...markdownComponents } ),
		[ markdownComponents ]
	);

	const messageRenderer = useMemo(
		() =>
			createMessageRenderer( {
				components: mergedComponents,
				extensions: markdownExtensions,
			} ),
		[ mergedComponents, markdownExtensions ]
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
			thinkingMessage={ thinkingMessage ?? undefined }
			error={ error }
			onSubmit={ onSubmit }
			variant={ isDocked ? 'embedded' : 'floating' }
			suggestions={ suggestions }
			clearSuggestions={ clearSuggestions }
			onSuggestionClick={ onSuggestionClick }
			floatingChatState={ floatingChatState }
			onClose={ onClose }
			onExpand={ onExpand }
			onStop={ onAbort }
			messageRenderer={ messageRenderer }
			inputValue={ inputValue }
			onInputChange={ onInputChange }
			messagesPosition="bottom"
			expandOnHover={ false }
			notice={ notice }
			emptyView={
				isLoadingConversation ? (
					<ChatMessageSkeleton count={ 3 } />
				) : (
					<EmptyView
						heading={ getEmptyViewHeading() }
						help={ emptyViewSuggestions.length > 0 ? getEmptyViewHelp() : undefined }
						suggestions={ emptyViewSuggestions }
						icon={ <AI size={ 32 } /> }
					/>
				)
			}
		>
			<AgentUI.ConversationView ref={ conversationViewRef }>
				<ChatHeader onClose={ onClose } options={ chatHeaderOptions } />
				{ isLoadingConversation ? <ChatMessageSkeleton count={ 3 } /> : <AgentUI.Messages /> }
				{ ( onContextCardAction || onContextCardDismiss ) && (
					<ContextCards onAction={ onContextCardAction } onDismiss={ onContextCardDismiss } />
				) }
				{ showFeedbackInput && (
					<FeedbackInput onSubmit={ onSubmitFeedbackText } onCancel={ onCancelFeedback } />
				) }
				{ alternativeFooter ? (
					alternativeFooter
				) : (
					<AgentUI.Footer>
						<AgentUI.Suggestions />
						<AgentUI.Notice />
						{ imageUpload && (
							<ImageUploader
								ref={ imageUploaderRef }
								images={ imageUpload.pendingImages }
								uploadingImages={ imageUpload.uploadingImages }
								onFilesSelected={ imageUpload.handleFilesSelected }
								onRemoveImage={ imageUpload.handleRemoveImage }
								acceptedFileTypes={ acceptedImageFileTypes }
								showFileMetadata
								allowDragToInsert={ false }
								dropZoneRef={ conversationViewRef }
							/>
						) }
						<SelectedBlock />
						<AgentUI.Input
							imageUploaderRef={ imageUpload ? imageUploaderRef : undefined }
							disabled={ imageUpload?.pendingImages?.length ? false : undefined }
						/>
					</AgentUI.Footer>
				) }
			</AgentUI.ConversationView>
		</AgentUI.Container>
	);
}
