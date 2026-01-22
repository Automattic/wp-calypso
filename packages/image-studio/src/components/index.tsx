/**
 * WordPress dependencies
 */
import {
	__unstableAnimatePresence as AnimatePresence,
	Modal,
	__unstableMotion as motion,
} from '@wordpress/components';
import { useMediaQuery, withInstanceId } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
/**
 * External dependencies
 */
import { getAgentManager, useAgentChat } from '@automattic/agenttic-client';
import { AgentUI, cn } from '@automattic/agenttic-ui';

/**
 * Internal dependencies
 */
import { useAgentConfig } from '../hooks/use-agent-config';
import { defaultAgentConfigFactory, type AgentConfigFactory } from '../utils/agent-config';
import { useAnnotation } from '../hooks/use-annotation';
import { useBeforeUnload } from '../hooks/use-beforeunload';
import { useImageStudioAgentSync } from '../hooks/use-image-studio-agent-sync';
import { useImageStudioMessageDisplay } from '../hooks/use-image-studio-message-display';
import { useImageStudioSuggestions } from '../hooks/use-image-studio-suggestions';
import { useImageUrl } from '../hooks/use-image-url';
import { useImageLoaded } from '../hooks/use-image-loaded';
import { useSaveShortcut } from '../hooks/use-save-shortcut';
import { useUnsavedChangesConfirmation } from '../hooks/use-unsaved-changes-confirmation';
import { type ImageStudioActions, store as imageStudioStore } from '../store';
import {
	type ImageStudioConfig,
	ImageStudioMode,
	type ImageStudioProps,
	ToolbarOption,
} from '../types';
import { trackImageStudioError, trackImageStudioPromptSent } from '../utils/tracking';
import { getSessionId } from '../utils/session';
import AnnotationCanvas from './annotation-canvas';
import { ConfirmationDialog } from './confirmation-dialog';
import { EditLayout } from './edit-layout';
import { GenerateLayout } from './generate-layout';
import { Header } from './header';
import { ImageFeedbackButtons } from './image-feedback-buttons';
import { Footer } from './footer';
import LoadingSpinner from './loading-spinner';
import { ImageStudioAltTextSidebar } from './sidebar';
import { ImageStudioNotice } from './notice';
import { StylePicker } from './style-picker';
import { AspectRatioPicker } from './aspect-ratio-picker';
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
			? __( 'Describe what you want to add, remove, or replace…', 'default' )
			: __( 'Describe your image', 'default' );

	const { handleSuggestionClick } = useImageStudioSuggestions(
		agentChatProps.registerSuggestions,
		agentChatProps.clearSuggestions,
		displayMessages,
		mode
	);

	const handleSubmit = useCallback(
		async ( message: string ) => {
			try {
				await onChatSubmit?.();
			} catch ( error ) {
				trackImageStudioError( {
					mode,
					errorType: 'preparation_failed',
					attachmentId,
				} );

				addNotice( __( 'Failed to send message.', 'default' ), 'error' );

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
		if ( ! agentError ) return;
		const errorMessage =
			( agentError as unknown as Error )?.message ||
			String( agentError ) ||
			__( 'An error occurred while generating content.', 'default' );
		addNotice( errorMessage, 'error' );
	}, [ agentError, addNotice ] );

	const isProcessing = agentChatProps.isProcessing || isAnnotationSaving;

	const handleStop = isAnnotationSaving ? undefined : agentChatProps.abortCurrentRequest;

	// Use simple AgentUI for Edit mode (no composable pattern)
	if ( mode === ImageStudioMode.Edit ) {
		return (
			<AgentUI
				{ ...agentUiProps }
				messages={ displayMessages as any }
				variant="embedded"
				placeholder={ placeholder }
				className="image-studio-agent agenttic"
				onSubmit={ handleSubmit }
				onSuggestionClick={ handleSuggestionClick }
				onStop={ handleStop }
				isProcessing={ isProcessing }
				thinkingMessage={ agentChatProps.progressMessage ?? undefined }
			/>
		);
	}

	// Use composable pattern for Generate mode (with InputToolbar for style selection)
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
		>
			<AgentUI.ConversationView showHeader={ false }>
				<AgentUI.Messages />
				<AgentUI.Footer>
					<AgentUI.Notice />
					<AgentUI.Input />
					<div className="image-studio-modal__input-toolbar">
						<AspectRatioPicker disabled={ isProcessing } />
						<StylePicker disabled={ isProcessing } />
					</div>
				</AgentUI.Footer>
				<AgentUI.Suggestions onSelect={ ( message ) => handleSuggestionClick( message, [] ) } />
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
			<div className="image-studio-agent-loading">{ __( 'Loading AI assistant…', 'default' ) }</div>
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
		className,
		config,
		modalOpenKey,
		agentConfigFactory,
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

		// Get session ID
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

		// Initialize sidebar state from persisted preference when modal opens
		useEffect( () => {
			// Only initialize when modal first opens (modalOpenKey changes)
			if ( lastModalOpenKey.current !== modalOpenKey ) {
				lastModalOpenKey.current = modalOpenKey;
				if ( isSidebarOpen ) {
					setActiveToolbarOption( ToolbarOption.AltText );
				}
			}
		}, [ modalOpenKey, isSidebarOpen ] );

		const handleChatSubmit = useCallback( async () => {
			if ( hasAnnotations ) {
				await handleAnnotationDone();
			}

			setIsPromptSent( true );
		}, [ hasAnnotations, handleAnnotationDone ] );

		// Sync activeToolbarOption changes to store for persistence
		useEffect( () => {
			const isImageInfoActiveSidebar = activeToolbarOption === ToolbarOption.AltText;
			if ( isImageInfoActiveSidebar !== isSidebarOpen ) {
				setIsSidebarOpen( isImageInfoActiveSidebar );
			}
		}, [ activeToolbarOption, isSidebarOpen, setIsSidebarOpen ] );

		// Wrapped save handler that shows success message
		const handleSaveWithNotification = useCallback( async () => {
			setIsSaving( true );
			try {
				await onSave();
				// Show success message via notice system
				addNotice( __( 'Image saved to Media Library', 'default' ), 'success' );
			} finally {
				setIsSaving( false );
			}
		}, [ onSave, addNotice ] );

		const memoizedConfig = useMemo( () => config, [ config ] );
		const isMediumUp = useMediaQuery( '(min-width: 768px)' );

		const imageAltText =
			config?.imageData?.alt || config?.imageData?.title || __( 'Image being edited', 'default' );

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

		const feedbackButtons =
			sessionId && finalDisplayUrl ? (
				<ImageFeedbackButtons
					imageUrl={ finalDisplayUrl }
					attachmentId={ attachmentId }
					sessionId={ sessionId }
					mode={ mode }
					isVisible={ showFeedbackButtons }
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
					aria-label={ __( 'Image Studio', 'default' ) }
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
								feedbackButtons={ feedbackButtons }
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
						title={ __( 'Unsaved changes', 'default' ) }
						actions={ [
							{
								text: __( 'Discard', 'default' ),
								onClick: handleConfirmDiscard,
								variant: 'secondary',
								isDestructive: true,
							},
							{
								text: __( 'Save', 'default' ),
								onClick: handleConfirmSave,
								variant: 'primary',
							},
						] }
						onClose={ handleConfirmCancel }
					>
						{ __( 'Do you want to save this image?', 'default' ) }
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
	className,
	config,
	agentConfigFactory,
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
			className={ className }
			config={ config }
			modalOpenKey={ modalOpenKey }
			agentConfigFactory={ agentConfigFactory }
		/>
	);
};

export default ImageStudio;
