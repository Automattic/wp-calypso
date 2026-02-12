import { getAgentManager, useAgentChat } from '@automattic/agenttic-client';
import { AgentUI, cn, ThinkingMessage } from '@automattic/agenttic-ui';
import {
	__unstableAnimatePresence as AnimatePresence,
	Modal,
	__unstableMotion as motion,
} from '@wordpress/components';
import { useMediaQuery, withInstanceId } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAgentConfig } from '../hooks/use-agent-config';
import { useAnnotation } from '../hooks/use-annotation';
import { useBeforeUnload } from '../hooks/use-beforeunload';
import { useDraftCleanup } from '../hooks/use-draft-cleanup';
import { useImageLoaded } from '../hooks/use-image-loaded';
import { useImageStudioAgentSync } from '../hooks/use-image-studio-agent-sync';
import { useImageStudioMessageDisplay } from '../hooks/use-image-studio-message-display';
import { useImageStudioSuggestions } from '../hooks/use-image-studio-suggestions';
import { useImageUrl } from '../hooks/use-image-url';
import { useRevertToOriginal } from '../hooks/use-revert-to-original';
import { useSaveShortcut } from '../hooks/use-save-shortcut';
import { useUnsavedChangesConfirmation } from '../hooks/use-unsaved-changes-confirmation';
import { type ImageStudioActions, store as imageStudioStore } from '../store';
import {
	type ImageStudioConfig,
	ImageStudioMode,
	type ImageStudioProps,
	ToolbarOption,
} from '../types';
import { defaultAgentConfigFactory, type AgentConfigFactory } from '../utils/agent-config';
import { getSessionId } from '../utils/session';
import { trackImageStudioError, trackImageStudioPromptSent } from '../utils/tracking';
import AnnotationCanvas from './annotation-canvas';
import { AspectRatioPicker } from './aspect-ratio-picker';
import { CanvasControls } from './canvas-controls';
import { ConfirmationDialog } from './confirmation-dialog';
import { EditLayout } from './edit-layout';
import { Footer } from './footer';
import { GenerateLayout } from './generate-layout';
import { Header } from './header';
import LoadingSpinner from './loading-spinner';
import { ImageStudioNotice } from './notice';
import { ImageStudioAltTextSidebar } from './sidebar';
import { StylePicker } from './style-picker';
import './style.scss';

function ImageStudioAgentChat( {
	agentConfig: agentConfigProp,
	attachmentId,
	mode,
	onChatSubmit,
}: {
	agentConfig: any;
	attachmentId?: number;
	mode: ImageStudioMode;
	onChatSubmit?: () => Promise< void > | void;
} ) {
	const agentChatProps = useAgentChat( agentConfigProp );
	const { addNotice } = useDispatch( imageStudioStore );
	// Storing the input value for detecting when it is cleared
	const [ inputValue, setInputValue ] = useState( '' );

	const isAnnotationSaving = useSelect( ( select ) => {
		return select( imageStudioStore ).getIsAnnotationSaving();
	}, [] );

	useEffect( () => {
		return () => {
			// When the component unmounts, abort any ongoing requests
			// If the modal is opened and closed quickly, it may be unmounted before the agent initialization completes.
			const agentManager = getAgentManager();
			if ( agentManager.hasAgent( agentConfigProp.agentId ) ) {
				agentChatProps?.abortCurrentRequest?.();
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- We only want to run this effect on mount, and clear on unmount. Hence we must keep the dependencies empty.
	}, [] );

	useImageStudioAgentSync( agentChatProps );

	const displayMessages = useImageStudioMessageDisplay( agentChatProps?.messages );

	const placeholder =
		mode === ImageStudioMode.Edit
			? __( 'Describe what you want to add, remove, or replace…', 'big-sky' )
			: __( 'Describe your image', 'big-sky' );

	const { handleSuggestionClick, isLoadingSuggestions, abortSuggestionsLoading } =
		useImageStudioSuggestions( {
			registerSuggestions: agentChatProps.registerSuggestions,
			clearSuggestions: agentChatProps.clearSuggestions,
			messages: displayMessages,
			mode,
			inputValue,
		} );

	const handleSubmit = useCallback(
		async ( message: string ) => {
			if ( isLoadingSuggestions ) {
				abortSuggestionsLoading();
			}

			try {
				await onChatSubmit?.();
			} catch ( error ) {
				trackImageStudioError( {
					mode,
					errorType: 'preparation_failed',
					attachmentId,
				} );

				addNotice( __( 'Failed to send message.', 'big-sky' ), 'error' );

				// Abort if onChatSubmit errors
				return;
			}

			trackImageStudioPromptSent( {
				mode,
				messageLength: message?.length || 0,
			} );

			try {
				await agentChatProps.onSubmit?.( message );
			} catch ( error ) {
				// Track the error
				trackImageStudioError( {
					mode,
					errorType: mode === ImageStudioMode.Edit ? 'edit_failed' : 'generation_failed',
					attachmentId,
				} );
				// Re-throw to allow error to be handled by the UI
				throw error;
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ agentChatProps, onChatSubmit, mode ]
	);

	const { error: agentError, ...agentUiProps } = agentChatProps;

	useEffect( () => {
		if ( ! agentError ) {
			return;
		}
		const errorMessage =
			( agentError as unknown as Error )?.message ||
			String( agentError ) ||
			__( 'An error occurred while generating content.', 'big-sky' );
		addNotice( errorMessage, 'error' );
	}, [ agentError, addNotice ] );

	const isProcessing = agentChatProps.isProcessing || isAnnotationSaving;

	const handleStop = isAnnotationSaving ? undefined : agentChatProps.abortCurrentRequest;

	const suggestionsComponent = isLoadingSuggestions ? (
		<div className="image-studio-suggestions-loading">
			<ThinkingMessage content={ __( 'Generating suggestions…', 'big-sky' ) } />
		</div>
	) : (
		<AgentUI.Suggestions />
	);

	return (
		<AgentUI.Container
			{ ...agentUiProps }
			messages={ displayMessages as any }
			variant="embedded"
			placeholder={ placeholder }
			className="image-studio-agent agenttic"
			onSubmit={ handleSubmit }
			onStop={ handleStop }
			isProcessing={ isProcessing }
			thinkingMessage={ agentChatProps.progressMessage ?? undefined }
			inputValue={ inputValue }
			onInputChange={ setInputValue }
			onSuggestionClick={ handleSuggestionClick }
		>
			<AgentUI.ConversationView showHeader={ false }>
				<AgentUI.Messages />
				<AgentUI.Footer>
					{ suggestionsComponent }
					<AgentUI.Notice />
					<AgentUI.Input />
					<div className="image-studio-modal__input-toolbar">
						{ mode === ImageStudioMode.Generate && <AspectRatioPicker disabled={ isProcessing } /> }
						<StylePicker disabled={ isProcessing } />
					</div>
				</AgentUI.Footer>
			</AgentUI.ConversationView>
		</AgentUI.Container>
	);
}

const ImageStudioAgentUIComponent = ( {
	config,
	modalOpenKey,
	onChatSubmit,
	mode,
	agentConfigFactory = defaultAgentConfigFactory,
}: {
	config: ImageStudioConfig;
	modalOpenKey?: number;
	onChatSubmit?: () => void;
	mode: ImageStudioMode;
	agentConfigFactory?: AgentConfigFactory;
} ) => {
	const attachmentId = config?.attachmentId;
	const agentConfigState = useAgentConfig( agentConfigFactory, modalOpenKey );

	if ( ! agentConfigState ) {
		return (
			<div className="image-studio-agent-loading">{ __( 'Loading AI assistant…', 'big-sky' ) }</div>
		);
	}

	return (
		<ImageStudioAgentChat
			key={ `agentchat-${ modalOpenKey || 'default' }` }
			agentConfig={ agentConfigState }
			attachmentId={ attachmentId }
			mode={ mode }
			onChatSubmit={ onChatSubmit }
		/>
	);
};

const ImageStudioAgentUI = memo( ImageStudioAgentUIComponent );

const ImageStudioContent = withInstanceId(
	( {
		onSave,
		onDiscard,
		onExit,
		onClassicMediaEditorNavigation,
		onNavigatePrevious,
		onNavigateNext,
		hasPreviousImage,
		hasNextImage,
		className,
		config,
		modalOpenKey,
		agentConfigFactory = defaultAgentConfigFactory,
	}: Omit< ImageStudioProps, 'image' > & {
		instanceId: string | number;
		modalOpenKey?: number;
	} ) => {
		const {
			isAiProcessing,
			isAnnotationSaving,
			displayImageUrl,
			originalImageUrl,
			isAnnotationMode,
			attachmentId,
			isCurrentAttachmentAnnotated,
			hasUnsavedChanges,
			originalAttachmentId,
			isSidebarOpen,
		} = useSelect( ( select ) => {
			const selectors = select( imageStudioStore );
			const currentAttachmentId = selectors.getImageStudioAttachmentId();
			const annotatedAttachmentIds = selectors.getAnnotatedAttachmentIds();
			return {
				isAiProcessing: selectors.getImageStudioAiProcessing(),
				displayImageUrl: selectors.getImageStudioCurrentImageUrl(),
				originalImageUrl: selectors.getImageStudioOriginalImageUrl(),
				isAnnotationMode: selectors.getIsAnnotationMode(),
				attachmentId: currentAttachmentId,
				isAnnotationSaving: selectors.getIsAnnotationSaving(),
				isCurrentAttachmentAnnotated:
					currentAttachmentId !== null && annotatedAttachmentIds.includes( currentAttachmentId ),
				hasUnsavedChanges: selectors.getHasUnsavedChanges(),
				originalAttachmentId: selectors.getOriginalAttachmentId(),
				isSidebarOpen: selectors.getIsSidebarOpen(),
			};
		}, [] );

		const { addNotice, setIsSidebarOpen } = useDispatch( imageStudioStore ) as ImageStudioActions;

		// Get session ID (persistent across sessions)
		const sessionId = getSessionId();

		const {
			handleAnnotationDone,
			hasAnnotations,
			hasUndoneAnnotations,
			handleAnnotationUndo,
			handleAnnotationRedo,
		} = useAnnotation( {
			originalImageUrl,
		} );

		const [ isPromptSent, setIsPromptSent ] = useState( false );
		const [ activeToolbarOption, setActiveToolbarOption ] = useState< ToolbarOption | null >(
			null
		);
		const [ isSaving, setIsSaving ] = useState( false );

		// Track the last modal key to detect when modal reopens
		const lastModalOpenKey = useRef< number | undefined >();
		// Track attachment ID to detect navigation
		const prevAttachmentIdRef = useRef< number | null >( null );
		// Track activeToolbarOption to detect user interaction (vs. programmatic changes)
		const prevActiveToolbarOptionRef = useRef< ToolbarOption | null >( activeToolbarOption );

		const handleChatSubmit = useCallback( async () => {
			if ( hasAnnotations ) {
				await handleAnnotationDone();
			}

			setIsPromptSent( true );
		}, [ hasAnnotations, handleAnnotationDone ] );

		// Sync store state to component state when modal opens or navigating between images
		useEffect( () => {
			const hasModalOpened = lastModalOpenKey.current !== modalOpenKey;
			const hasNavigated =
				prevAttachmentIdRef.current !== null && prevAttachmentIdRef.current !== attachmentId;

			// Sync on modal open or navigation
			if ( hasModalOpened || hasNavigated ) {
				const shouldBeOpen = isSidebarOpen;
				const isCurrentlyOpen = activeToolbarOption === ToolbarOption.AltText;

				if ( shouldBeOpen && ! isCurrentlyOpen ) {
					setActiveToolbarOption( ToolbarOption.AltText );
				} else if ( ! shouldBeOpen && isCurrentlyOpen ) {
					setActiveToolbarOption( null );
				}
			}

			// Update refs
			lastModalOpenKey.current = modalOpenKey;
			prevAttachmentIdRef.current = attachmentId;
		}, [ modalOpenKey, attachmentId, isSidebarOpen, activeToolbarOption ] );

		// Sync activeToolbarOption changes to store for persistence
		// Only sync when user actually changed the toolbar option (not programmatic changes during navigation)
		useEffect( () => {
			const hasToolbarOptionChanged = prevActiveToolbarOptionRef.current !== activeToolbarOption;

			if ( hasToolbarOptionChanged ) {
				const isImageInfoActiveSidebar = activeToolbarOption === ToolbarOption.AltText;
				if ( isImageInfoActiveSidebar !== isSidebarOpen ) {
					setIsSidebarOpen( isImageInfoActiveSidebar );
				}

				prevActiveToolbarOptionRef.current = activeToolbarOption;
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [ activeToolbarOption ] );

		// Wrapped save handler that shows success message
		const handleSaveWithNotification = useCallback( async () => {
			setIsSaving( true );
			try {
				await onSave();
				// Show success message via notice system
				addNotice( __( 'Image saved to Media Library', 'big-sky' ), 'success' );
			} finally {
				setIsSaving( false );
			}
		}, [ onSave, addNotice ] );

		const memoizedConfig = useMemo( () => config, [ config ] );
		const isMediumUp = useMediaQuery( '(min-width: 768px)' );

		const imageAltText =
			config?.imageData?.alt || config?.imageData?.title || __( 'Image being edited', 'big-sky' );

		const imageUrl = useImageUrl( originalImageUrl );
		const finalDisplayUrl = displayImageUrl || imageUrl;
		const showProcessingOverlay = isAiProcessing;
		const isAiProcessed = ! isAnnotationSaving && ! isAiProcessing && !! displayImageUrl;

		// Enable save keyboard shortcut (Cmd+S / Ctrl+S)
		// Only enabled when: not processing, image has been edited by AI
		const isSaveEnabled = ! isAiProcessing && hasUnsavedChanges;

		const handleSaveShortcut = useCallback( () => {
			onSave();
		}, [ onSave ] );

		useSaveShortcut( handleSaveShortcut, isSaveEnabled );
		useBeforeUnload();

		const {
			isConfirmDialogOpen,
			isExiting,
			handleRequestClose,
			handleConfirmSave,
			handleConfirmDiscard,
			handleConfirmCancel,
		} = useUnsavedChangesConfirmation( {
			onSave,
			onDiscard,
			onExit,
		} );

		// Revert to original functionality
		const { deleteDraftsExcept } = useDraftCleanup();
		const { handleRevertToOriginal, canRevert } = useRevertToOriginal( {
			deleteDraftsExcept,
		} );

		const mode: ImageStudioMode = memoizedConfig?.attachmentId
			? ImageStudioMode.Edit
			: ImageStudioMode.Generate;

		const modalClasses = cn(
			'image-studio-modal',
			{
				'image-studio-modal--generate': mode === ImageStudioMode.Generate,
				'image-studio-modal--edit': mode === ImageStudioMode.Edit,
			},
			className
		);

		const {
			isLoaded: isRenderedImageLoaded,
			handleLoad,
			handleError,
			imageRef,
			refCallback,
		} = useImageLoaded( finalDisplayUrl );

		const imageNode = finalDisplayUrl ? (
			<img
				ref={ refCallback }
				className="image-studio-image"
				src={ finalDisplayUrl }
				alt={ imageAltText }
				onLoad={ handleLoad }
				onError={ handleError }
			/>
		) : null;

		const annotationOverlay = isAnnotationMode ? (
			<AnnotationCanvas imageUrl={ finalDisplayUrl } imageElement={ imageRef.current } />
		) : null;

		// Show feedback buttons when image is AI-processed and not in other states
		// Don't show for annotated images as they will have different suggestions
		const showFeedbackButtons =
			! isCurrentAttachmentAnnotated && !! isAiProcessed && !! finalDisplayUrl;

		// Show actions menu only in Edit mode after AI has made changes.
		// canRevert already checks: originalAttachmentId exists, image changed, not processing
		const showImageActionsMenu = mode === ImageStudioMode.Edit && canRevert;

		const showCanvasControls = !! finalDisplayUrl && isRenderedImageLoaded && !! isAiProcessed;

		const canvasControls = showCanvasControls ? (
			<CanvasControls
				imageUrl={ finalDisplayUrl }
				attachmentId={ attachmentId }
				sessionId={ sessionId }
				mode={ mode }
				showFeedbackButtons={ showFeedbackButtons }
				showImageActionsMenu={ showImageActionsMenu }
				onSave={ handleSaveWithNotification }
				onRevertToOriginal={ handleRevertToOriginal }
			/>
		) : null;

		return (
			<>
				<Modal
					bodyOpenClassName="is-image-studio-open"
					overlayClassName="image-studio-overlay"
					className={ modalClasses }
					__experimentalHideHeader
					onRequestClose={ handleRequestClose }
					aria-label={ __( 'Image Studio', 'big-sky' ) }
				>
					<div className="image-studio-modal__content">
						<Header
							config={ config }
							mode={ mode }
							isSaveable={ ! isAiProcessing && hasUnsavedChanges }
							isSaving={ isSaving }
							onSave={ handleSaveWithNotification }
							setActiveToolbarOption={ setActiveToolbarOption }
							activeToolbarOption={ activeToolbarOption }
							onAnnotationUndo={ handleAnnotationUndo }
							onAnnotationRedo={ handleAnnotationRedo }
							// Any close from Header flows into the same confirmation logic
							onClose={ handleRequestClose }
							hasPendingAnnotations={ hasAnnotations }
							hasUndoneAnnotations={ hasUndoneAnnotations }
							onClassicMediaEditorNavigation={ onClassicMediaEditorNavigation }
							onNavigatePrevious={ onNavigatePrevious }
							onNavigateNext={ onNavigateNext }
							hasPreviousImage={ hasPreviousImage }
							hasNextImage={ hasNextImage }
						/>

						{ mode === ImageStudioMode.Edit ? (
							<EditLayout
								isRenderedImageLoaded={ isRenderedImageLoaded }
								imageUrl={ finalDisplayUrl }
								image={ imageNode }
								isAiProcessing={ isAiProcessing }
								isAnnotationSaving={ isAnnotationSaving }
								isAiProcessed={ isAiProcessed }
								overlay={ annotationOverlay }
								showProcessingOverlay={ showProcessingOverlay }
								canvasControls={ canvasControls }
								attachmentId={ attachmentId }
								isCurrentAttachmentAnnotated={ isCurrentAttachmentAnnotated }
								originalAttachmentId={ originalAttachmentId }
							/>
						) : (
							<GenerateLayout isAiProcessing={ isAiProcessing } isPromptSent={ isPromptSent } />
						) }

						<Footer
							chatComponent={
								<ImageStudioAgentUI
									config={ memoizedConfig }
									modalOpenKey={ modalOpenKey }
									onChatSubmit={ handleChatSubmit }
									mode={ mode }
									agentConfigFactory={ agentConfigFactory }
								/>
							}
						></Footer>
					</div>

					<div className="image-studio-modal__sidebar">
						<AnimatePresence>
							{ activeToolbarOption === ToolbarOption.AltText && mode === ImageStudioMode.Edit && (
								<motion.div
									initial={ { width: 0 } }
									animate={ {
										width: isMediumUp ? 300 : undefined,
									} }
									exit={ { width: 0 } }
									className="image-studio-modal__sidebar-inner"
								>
									<ImageStudioAltTextSidebar onClose={ () => setActiveToolbarOption( null ) } />
								</motion.div>
							) }
						</AnimatePresence>
					</div>
					<div className="image-studio-modal__notices">
						<ImageStudioNotice />
					</div>
				</Modal>

				{ isExiting && (
					<div className="image-studio-exit-overlay">
						<LoadingSpinner aria-live="polite" role="status" />
					</div>
				) }

				{ isConfirmDialogOpen && (
					<ConfirmationDialog
						isOpen={ isConfirmDialogOpen }
						title={ __( 'Unsaved changes', 'big-sky' ) }
						actions={ [
							{
								text: __( 'Discard', 'big-sky' ),
								onClick: handleConfirmDiscard,
								variant: 'secondary',
								isDestructive: true,
							},
							{
								text: __( 'Save', 'big-sky' ),
								onClick: handleConfirmSave,
								variant: 'primary',
							},
						] }
						onClose={ handleConfirmCancel }
					>
						{ __( 'Do you want to save this image?', 'big-sky' ) }
					</ConfirmationDialog>
				) }
			</>
		);
	}
);

const ImageStudio = ( {
	image,
	onSave,
	onDiscard,
	onExit,
	onClassicMediaEditorNavigation,
	onNavigatePrevious,
	onNavigateNext,
	hasPreviousImage,
	hasNextImage,
	className,
	config,
	agentConfigFactory = defaultAgentConfigFactory,
}: ImageStudioProps ) => {
	const { setImageStudioOriginalImageUrl } = useDispatch( imageStudioStore ) as ImageStudioActions;

	const modalOpenKey = useMemo( () => Date.now(), [] );

	useEffect( () => {
		if ( typeof image === 'string' ) {
			setImageStudioOriginalImageUrl( image );
		} else if ( image instanceof File ) {
			setImageStudioOriginalImageUrl( image as any );
		}
	}, [ image, setImageStudioOriginalImageUrl ] );

	return (
		<ImageStudioContent
			onSave={ onSave }
			onDiscard={ onDiscard }
			onExit={ onExit }
			onClassicMediaEditorNavigation={ onClassicMediaEditorNavigation }
			onNavigatePrevious={ onNavigatePrevious }
			onNavigateNext={ onNavigateNext }
			hasPreviousImage={ hasPreviousImage }
			hasNextImage={ hasNextImage }
			className={ className }
			config={ config }
			modalOpenKey={ modalOpenKey }
			agentConfigFactory={ agentConfigFactory }
		/>
	);
};

export default ImageStudio;
