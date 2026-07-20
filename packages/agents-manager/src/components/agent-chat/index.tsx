import {
	AgentUI,
	createMessageRenderer,
	ImageUploader,
	type ImageUploaderHandle,
	type MarkdownComponents,
	type MarkdownExtensions,
	type Suggestion,
	type ChatState,
	type UploadedImage,
} from '@automattic/agenttic-ui';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useMemo, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { formatWritingSuggestionLabels } from '../../hooks/use-empty-view-suggestions';
import useHasAiChatEntryButton from '../../hooks/use-has-ai-chat-entry-button';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { getAgentsManagerInlineData } from '../../utils/get-agents-manager-inline-data';
import { isEditorPage } from '../../utils/is-editor-page';
import { isReaderChatHost } from '../../utils/is-reader-chat-agent';
import { recordBigSkyTracksEvent } from '../../utils/tracks';
import ChatHeader, { type Options as ChatHeaderOptions } from '../chat-header';
import ChatMessageSkeleton from '../chat-message-skeleton';
import ContextCards from '../context-cards';
import CustomALink from '../custom-a-link';
import FeedbackInput from '../feedback-input';
import { AI } from '../icons';
import SelectedBlock from '../selected-block';
import getSuggestionClickPayload from './get-suggestion-click-payload';
import GroupedEmptyView from './grouped-empty-view';
import type { UseImageUploadResult } from '../../hooks/use-image-upload';
import type { ExternalContextCard, ExternalContextCardAction } from '../../utils/external-context';
import type { Message, NoticeConfig } from '@automattic/agenttic-ui/dist/types';
import type { AgentsManagerSelect } from '@automattic/data-stores';
import type { ComponentProps, RefObject } from 'react';

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
	/** Custom thinking message to display while the agent is processing. */
	thinkingMessage?: string | null;
	/** Indicates if a conversation is being loaded. */
	isLoadingConversation: boolean;
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
	/** Called when a suggestion is clicked. */
	onSuggestionClick?: (
		selectedSuggestion: Suggestion | string,
		availableSuggestions?: Suggestion[]
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

const DEFAULT_ACCEPTED_IMAGE_TYPES = [
	'image/jpeg',
	'image/png',
	'image/heic',
	'image/heif',
	'image/heic-sequence',
	'image/heif-sequence',
];

/**
 * Returns the empty-view greeting. Priority:
 *   1. Explicit host override via `window.agentsManagerData.emptyViewHeading`.
 *   2. Reader-chat default (contextual to blog frontends).
 *   3. Orchestrator default.
 */
function getEmptyViewHeading(): string {
	const override = getAgentsManagerInlineData()?.emptyViewHeading;
	if ( override ) {
		return override;
	}
	if ( isReaderChatHost() ) {
		return __( 'Ask me anything about this blog.', __i18n_text_domain__ );
	}
	return __( 'Howdy! How can I help you today?', __i18n_text_domain__ );
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
	complianceDisclosure,
	onContextCardAction,
	onContextCardDismiss,
}: Props ) {
	const { setFloatingPosition, setFreeDragPosition, setFloatingSize } =
		useDispatch( AGENTS_MANAGER_STORE );
	const conversationViewRef = useRef< HTMLDivElement >( null );
	const imageUploaderRef = useRef< ImageUploaderHandle >( null );
	const { floatingPosition, freeDragPosition, floatingSize } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	const mergedComponents = useMemo(
		() => ( { a: CustomALink, ...markdownComponents } ),
		[ markdownComponents ]
	);
	const shouldFormatWritingSuggestions = groupWritingSuggestions || isEditorPage();
	const displayedSuggestions = useMemo(
		() => formatWritingSuggestionLabels( suggestions, shouldFormatWritingSuggestions ),
		[ shouldFormatWritingSuggestions, suggestions ]
	);
	const handleDisplayedSuggestionClick = useCallback(
		( selectedSuggestion: Suggestion | string ) => {
			onSuggestionClick?.(
				getSuggestionClickPayload( selectedSuggestion, suggestions ),
				suggestions
			);
		},
		[ onSuggestionClick, suggestions ]
	);

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
	const trackImageUpload = ! isReaderChatHost() && !! imageUpload;

	const handleFilesSelected = useCallback(
		async ( files: File[] ) => {
			await imageUpload?.handleFilesSelected( files );
		},
		[ imageUpload ]
	);

	const handleBrowse = useCallback(
		( files: File[] ) => {
			if ( trackImageUpload ) {
				recordBigSkyTracksEvent( 'file_upload_click', {
					count: files.length,
				} );
			}
		},
		[ trackImageUpload ]
	);

	const handleDrop = useCallback(
		( files: File[] ) => {
			if ( trackImageUpload ) {
				recordBigSkyTracksEvent( 'file_upload_drop', {
					count: files.length,
				} );
			}
		},
		[ trackImageUpload ]
	);

	const handleRemoveImage = useCallback(
		( image: UploadedImage ) => {
			if ( trackImageUpload ) {
				recordBigSkyTracksEvent( 'file_upload_remove', {
					image_id: image.id,
				} );
			}
			imageUpload?.handleRemoveImage( image );
		},
		[ imageUpload, trackImageUpload ]
	);

	const handleImageDragStart = useCallback( () => {
		if ( trackImageUpload ) {
			recordBigSkyTracksEvent( 'file_upload_drag_start' );
		}
	}, [ trackImageUpload ] );

	const handleUploadError = useCallback( () => {
		if ( trackImageUpload ) {
			recordBigSkyTracksEvent( 'file_upload_invalid' );
		}
	}, [ trackImageUpload ] );

	return (
		<AgentUI.Container
			initialChatPosition={ floatingPosition }
			onChatPositionChange={ ( position ) => setFloatingPosition( position ) }
			initialFreeDragPosition={ freeDragPosition ?? undefined }
			onFreeDragEnd={ setFreeDragPosition }
			defaultSize={ floatingSize ?? undefined }
			onResizeEnd={ setFloatingSize }
			className={ clsx( 'agenttic', { dark: isDocked } ) }
			messages={ messages }
			isProcessing={ isProcessing }
			thinkingMessage={ thinkingMessage ?? undefined }
			error={ error }
			onSubmit={ onSubmit }
			variant={ isDocked ? 'embedded' : 'floating' }
			freeDrag={ ! isDocked }
			resizable={ ! isDocked }
			suggestions={ displayedSuggestions }
			clearSuggestions={ clearSuggestions }
			onSuggestionClick={ onSuggestionClick ? handleDisplayedSuggestionClick : undefined }
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
					<GroupedEmptyView
						heading={ getEmptyViewHeading() }
						help={ emptyViewSuggestions.length > 0 ? getEmptyViewHelp() : undefined }
						suggestions={ emptyViewSuggestions }
						groupWritingSuggestions={ groupWritingSuggestions }
						onSuggestionClick={ onSuggestionClick }
						icon={ <AI size={ 32 } /> }
					/>
				)
			}
		>
			<AgentUI.ConversationView ref={ conversationViewRef }>
				<ChatHeader onClose={ onClose } options={ chatHeaderOptions } isDocked={ isDocked } />
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
						<SelectedBlock />
						{ /* `readOnly` (not `disabled`) so the stop button stays active while a batch uploads. */ }
						<AgentUI.Input
							imageUploaderRef={
								imageUpload ? ( imageUploaderRef as RefObject< ImageUploaderHandle > ) : undefined
							}
							imageUploadDisabled={ imageUpload?.isUploadingImages }
							readOnly={ imageUpload?.isUploadingImages }
							disabled={ imageUpload?.pendingImages?.length ? false : undefined }
						/>
					</AgentUI.Footer>
				) }
			</AgentUI.ConversationView>
		</AgentUI.Container>
	);
}
