import {
	AgentUI,
	createMessageRenderer,
	ImageUploader,
	type ImageUploaderHandle,
	type MarkdownComponents,
	type MarkdownExtensions,
	type NoticeConfig,
	type Suggestion,
	type ChatState,
	type UploadedImage,
	type TrailingActions,
} from '@automattic/agenttic-ui';
import { useCallback, useMemo, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { DEFAULT_ACCEPTED_UPLOAD_TYPES } from '../../constants';
import {
	useAgentticSuggestionClick,
	type SuggestionClickHandler,
} from '../../hooks/use-agenttic-suggestion-click';
import { formatWritingSuggestionLabels } from '../../hooks/use-empty-view-suggestions';
import useFloatingPanelProps from '../../hooks/use-floating-panel-props';
import useHasAiChatEntryButton from '../../hooks/use-has-ai-chat-entry-button';
import { getAgentsManagerInlineData } from '../../utils/get-agents-manager-inline-data';
import { isEditorPage } from '../../utils/is-editor-page';
import { isReaderChatHost } from '../../utils/is-reader-chat-agent';
import lazyComponent from '../../utils/lazy-component';
import { isSiteEditorContext } from '../../utils/site-editor-context';
import { recordBigSkyTracksEvent } from '../../utils/tracks';
import ChatHeader, { type Options as ChatHeaderOptions } from '../chat-header';
import ChatMessageSkeleton from '../chat-message-skeleton';
import ContextCards from '../context-cards';
import CustomALink from '../custom-a-link';
import FeedbackInput from '../feedback-input';
import GroupedEmptyView from './grouped-empty-view';
import type { UseImageUploadResult } from '../../hooks/use-image-upload';
import type { ExternalContextCard, ExternalContextCardAction } from '../../utils/external-context';
import type { UIMessage as Message } from '@automattic/agenttic-client';
import type { ComponentProps, ReactNode, RefObject } from 'react';

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
	/** Whether editor writing suggestions should render in a section. */
	groupWritingSuggestions?: boolean;
	/** Indicates if the chat is processing a request. */
	isProcessing: boolean;
	/** Whether the latest reply is still streaming. Defaults to `isProcessing`. */
	isStreaming?: boolean;
	/** Whether reply text is streaming in. When set, it drives the thinking indicator. */
	isReplying?: boolean;
	/** Custom thinking message to display while the agent is processing. */
	thinkingMessage?: string | null;
	/** Indicates if a conversation is being loaded. */
	isLoadingConversation: boolean;
	/** Rendered between the header and the message list, outside the list's scroll. */
	pinnedContent?: ReactNode;
	/** Rendered in the empty view in place of the suggestion chips. */
	emptyViewContent?: ReactNode;
	/** Indicates if the chat is docked in the sidebar. */
	isDocked: boolean;
	/** Indicates if the chat is expanded (floating mode). */
	isOpen: boolean;
	/** Called when the user submits a message. */
	onSubmit: ComponentProps< typeof AgentUI.Container >[ 'onSubmit' ];
	/** Called when the user aborts the current request. */
	onAbort: () => void;
	/** Called when the chat is closed. */
	onClose: () => void;
	/** Called when the chat is expanded (floating mode). */
	onExpand: () => void;
	/** Called to clear the suggestions. */
	clearSuggestions?: () => void;
	/** Called when a suggestion is clicked; `isInMessage` for a list inside a message. */
	onSuggestionClick?: SuggestionClickHandler;
	/** Called with the suggestions Agenttic actually renders (after truncation, only while visible). */
	onSuggestionsRendered?: ( shown: Suggestion[] ) => void;
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
	/** Content grouped with the composer's Send button (e.g. the credits meter). */
	trailingActions?: TrailingActions;
	/** Return false to keep the message in the input instead of sending it. */
	beforeSubmit?: ComponentProps< typeof AgentUI.Container >[ 'beforeSubmit' ];
	/** Indicates if the floating chat is in compact mode. */
	isCompactMode?: boolean;
	/** Image upload state. Enables the image uploader when set. */
	imageUpload?: UseImageUploadResult;
	/** MIME types accepted for image uploads. Defaults include HEIC/HEIF. */
	acceptedImageFileTypes?: string[];
	/** Whether to show the feedback text input (after thumbs down). */
	showFeedbackInput?: boolean;
	/** Called when the user submits feedback text. */
	onSubmitFeedbackText?: ( feedbackText: string ) => Promise< void >;
	/** Called when the user cancels the feedback input. */
	onCancelFeedback?: () => void;
	/** Alternative footer to render instead of the default footer. */
	alternativeFooter?: React.ReactNode;
	/** Disables the chat input: grayed out, typing and submission blocked. */
	isChatInputDisabled?: boolean;
	/**
	 * AI-interaction disclosure shown below the input (EU AI Act Art. 50(1)).
	 * Defaults to the shared "You're chatting with AI" line; pass `false` to
	 * hide it on surfaces that connect the user to a human (e.g. Zendesk).
	 */
	complianceDisclosure?: React.ReactNode | false;
	/** Called when a context card action button is clicked. */
	onContextCardAction?: ( card: ExternalContextCard, action: ExternalContextCardAction ) => void;
	/** Called when a context card's dismiss button is clicked. */
	onContextCardDismiss?: ( card: ExternalContextCard ) => void;
}

// Carries the block-editor stack, so it loads on demand and only on editor pages.
const SelectedBlock = lazyComponent(
	() => import( /* webpackChunkName: "am-selected-block" */ '../selected-block' )
);

// Opts into the router's private API, so it loads only on the one surface
// that uses it.
const EditorHistoryBridge = lazyComponent(
	() => import( /* webpackChunkName: "am-editor-history-bridge" */ '../editor-history-bridge' )
);

/**
 * Returns the empty-view greeting: the host's `agentsManagerData.emptyViewHeading`,
 * else the Reader chat or orchestrator default.
 */
function getEmptyViewHeading(): string {
	const override = getAgentsManagerInlineData()?.emptyViewHeading;
	if ( override ) {
		return override;
	}
	if ( isReaderChatHost() ) {
		return __( 'Ask me anything about this blog.', __i18n_text_domain__ );
	}
	return __( 'What should we work on next?', __i18n_text_domain__ );
}

function getEmptyViewHelp(): string {
	const override = getAgentsManagerInlineData()?.emptyViewHelp;
	if ( override ) {
		return override;
	}
	if ( isReaderChatHost() ) {
		return __( 'Or type your own question below.', __i18n_text_domain__ );
	}
	return __( 'Got a different request? Ask away.', __i18n_text_domain__ );
}

export default function AgentChat( {
	messages,
	suggestions,
	error = null,
	chatHeaderOptions,
	emptyViewSuggestions = [],
	groupWritingSuggestions = false,
	isProcessing,
	isStreaming,
	isReplying,
	thinkingMessage,
	isLoadingConversation,
	pinnedContent,
	emptyViewContent,
	isDocked,
	isOpen,
	onSubmit,
	onAbort,
	onClose,
	onExpand,
	clearSuggestions,
	onSuggestionClick,
	onSuggestionsRendered,
	notice,
	trailingActions,
	beforeSubmit,
	markdownComponents = {},
	markdownExtensions = {},
	onTypingStatusChange,
	inputValue,
	onInputChange,
	isChatInputDisabled,
	isCompactMode = false,
	imageUpload,
	acceptedImageFileTypes = DEFAULT_ACCEPTED_UPLOAD_TYPES,
	showFeedbackInput = false,
	onSubmitFeedbackText = () => Promise.resolve(),
	onCancelFeedback = () => {},
	alternativeFooter,
	complianceDisclosure,
	onContextCardAction,
	onContextCardDismiss,
}: Props ) {
	const conversationViewRef = useRef< HTMLDivElement >( null );
	const imageUploaderRef = useRef< ImageUploaderHandle >( null );
	const floatingPanelProps = useFloatingPanelProps();

	const mergedComponents = useMemo(
		() => ( { a: CustomALink, ...markdownComponents } ),
		[ markdownComponents ]
	);

	const shouldFormatWritingSuggestions = groupWritingSuggestions || isEditorPage();
	const displayedSuggestions = useMemo(
		() => formatWritingSuggestionLabels( suggestions, shouldFormatWritingSuggestions ),
		[ shouldFormatWritingSuggestions, suggestions ]
	);
	const handleDisplayedSuggestionClick = useAgentticSuggestionClick( {
		suggestions,
		hasMessages: messages.length > 0,
		onSuggestionClick,
	} );

	const messageRenderer = useMemo(
		() =>
			createMessageRenderer( {
				components: mergedComponents,
				extensions: markdownExtensions,
			} ),
		[ mergedComponents, markdownExtensions ]
	);

	// Without the AI chat entry button, use `collapsed` (a FAB) instead of `minimized`.
	let floatingChatState: ChatState = useHasAiChatEntryButton() ? 'minimized' : 'collapsed';
	if ( isOpen ) {
		floatingChatState = 'expanded';
	} else if ( isCompactMode ) {
		floatingChatState = 'compact';
	}

	// Image-upload tracking mirrors Big Sky's `file_upload_*` events.
	// Reader chat gets no `imageUpload`, but gate defensively so
	// `jetpack_big_sky_*` never fires from that surface.
	const shouldTrackImageUpload = ! isReaderChatHost() && !! imageUpload;

	const handleFilesSelected = useCallback(
		async ( files: File[] ) => {
			await imageUpload?.handleFilesSelected( files );
		},
		[ imageUpload ]
	);

	const handleBrowse = useCallback(
		( files: File[] ) => {
			if ( shouldTrackImageUpload ) {
				recordBigSkyTracksEvent( 'jetpack_big_sky_file_upload_click', {
					count: files.length,
				} );
			}
		},
		[ shouldTrackImageUpload ]
	);

	const handleDrop = useCallback(
		( files: File[] ) => {
			if ( shouldTrackImageUpload ) {
				recordBigSkyTracksEvent( 'jetpack_big_sky_file_upload_drop', {
					count: files.length,
				} );
			}
		},
		[ shouldTrackImageUpload ]
	);

	const handleRemoveImage = useCallback(
		( image: UploadedImage ) => {
			if ( shouldTrackImageUpload ) {
				recordBigSkyTracksEvent( 'jetpack_big_sky_file_upload_remove', {
					image_id: image.id,
				} );
			}
			imageUpload?.handleRemoveImage( image );
		},
		[ imageUpload, shouldTrackImageUpload ]
	);

	const handleImageDragStart = useCallback( () => {
		if ( shouldTrackImageUpload ) {
			recordBigSkyTracksEvent( 'jetpack_big_sky_file_upload_drag_start' );
		}
	}, [ shouldTrackImageUpload ] );

	const handleUploadError = useCallback( () => {
		if ( shouldTrackImageUpload ) {
			recordBigSkyTracksEvent( 'jetpack_big_sky_file_upload_invalid' );
		}
	}, [ shouldTrackImageUpload ] );

	return (
		<AgentUI.Container
			{ ...floatingPanelProps }
			className={ clsx( 'agenttic', { dark: isDocked } ) }
			messages={ messages }
			isProcessing={ isProcessing }
			isStreaming={ isStreaming }
			isReplying={ isReplying }
			thinkingMessage={ thinkingMessage ?? undefined }
			error={ error }
			onSubmit={ onSubmit }
			variant={ isDocked ? 'embedded' : 'floating' }
			freeDrag={ ! isDocked }
			resizable={ ! isDocked }
			suggestions={ displayedSuggestions }
			clearSuggestions={ clearSuggestions }
			onSuggestionClick={ onSuggestionClick ? handleDisplayedSuggestionClick : undefined }
			onSuggestionsRendered={ onSuggestionsRendered }
			onTypingStatusChange={ onTypingStatusChange }
			floatingChatState={ floatingChatState }
			triggerTitle={ __( 'Agent', __i18n_text_domain__ ) }
			onClose={ onClose }
			onExpand={ onExpand }
			onStop={ onAbort }
			messageRenderer={ messageRenderer }
			inputValue={ inputValue }
			onInputChange={ onInputChange }
			messagesPosition="bottom"
			expandOnHover={ false }
			notice={ notice }
			beforeSubmit={ beforeSubmit }
			// On the container so the floating compact composer gets it too
			trailingActions={ trailingActions }
			emptyView={
				isLoadingConversation ? (
					<ChatMessageSkeleton count={ 3 } />
				) : (
					<GroupedEmptyView
						heading={ getEmptyViewHeading() }
						help={
							emptyViewSuggestions.length > 0 || emptyViewContent ? getEmptyViewHelp() : undefined
						}
						content={ emptyViewContent }
						suggestions={ emptyViewSuggestions }
						groupWritingSuggestions={ groupWritingSuggestions }
						onSuggestionClick={ onSuggestionClick }
					/>
				)
			}
		>
			<AgentUI.ConversationView ref={ conversationViewRef }>
				{ isSiteEditorContext() && <EditorHistoryBridge /> }
				<ChatHeader onClose={ onClose } options={ chatHeaderOptions } isDocked={ isDocked } />
				{ pinnedContent }
				{ isLoadingConversation && messages.length === 0 ? (
					<ChatMessageSkeleton count={ 3 } />
				) : (
					<AgentUI.Messages />
				) }
				{ ( onContextCardAction || onContextCardDismiss ) && (
					<ContextCards onAction={ onContextCardAction } onDismiss={ onContextCardDismiss } />
				) }
				{ showFeedbackInput && (
					<FeedbackInput
						variant="dialog"
						onSubmit={ onSubmitFeedbackText }
						onCancel={ onCancelFeedback }
					/>
				) }
				{ alternativeFooter ? (
					alternativeFooter
				) : (
					<AgentUI.Footer complianceDisclosure={ complianceDisclosure }>
						<AgentUI.Suggestions />
						<AgentUI.Notice />
						{ imageUpload && (
							<ImageUploader
								ref={ imageUploaderRef }
								images={ imageUpload.pendingImages }
								uploadingImages={ imageUpload.uploadingImages }
								onFilesSelected={ handleFilesSelected }
								onBrowse={ handleBrowse }
								onDrop={ handleDrop }
								onRemoveImage={ handleRemoveImage }
								onImageDragStart={ handleImageDragStart }
								onError={ handleUploadError }
								acceptedFileTypes={ acceptedImageFileTypes }
								showFileMetadata
								allowDragToInsert={ false }
								disabled={ imageUpload.isUploadingImages }
								dropZoneRef={ conversationViewRef as RefObject< HTMLElement > }
							/>
						) }
						{ isEditorPage() && <SelectedBlock /> }
						{ /* Disabling the input takes both props: Agenttic forwards `readOnly` to the
						     textarea but uses `disabled` only to gate submitting (button and Enter).
						     Uploads set only `readOnly`, so the stop button stays active, and
						     `isChatInputDisabled` wins over the pending-images `false`, which lets
						     an image-only message be sent. */ }
						<AgentUI.Input
							imageUploaderRef={
								imageUpload ? ( imageUploaderRef as RefObject< ImageUploaderHandle > ) : undefined
							}
							imageUploadDisabled={ isChatInputDisabled || imageUpload?.isUploadingImages }
							readOnly={ isChatInputDisabled || imageUpload?.isUploadingImages }
							disabled={
								isChatInputDisabled || ( imageUpload?.pendingImages?.length ? false : undefined )
							}
						/>
					</AgentUI.Footer>
				) }
			</AgentUI.ConversationView>
		</AgentUI.Container>
	);
}
