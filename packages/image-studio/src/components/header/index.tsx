import { cn } from '@automattic/agenttic-ui';
import { Button, Icon } from '@wordpress/components';
import { useKeyboardShortcut } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { Fragment, useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { chevronLeft, chevronRight, close, external, redo, undo } from '@wordpress/icons';
import { isAppleOS } from '@wordpress/keycodes';
import {
	type ImageStudioActions,
	ImageStudioEntryPoint,
	store as imageStudioStore,
} from '../../store';
import { type ImageStudioConfig, ImageStudioMode, ToolbarOption } from '../../types';
import { trackImageStudioToolClick } from '../../utils/tracking';
import { AltIcon } from '../icons/AltIcon';
import { LassoIcon } from '../icons/LassoIcon';
import './style.scss';

interface HeaderProps {
	leftContent?: React.ReactNode;
	isSaveable?: boolean;
	isSaving?: boolean;
	mode: ImageStudioMode;
	onSave?: () => void;
	onClose: () => void;
	onAnnotationUndo?: () => void;
	onAnnotationRedo?: () => void;
	hasPendingAnnotations?: boolean;
	hasUndoneAnnotations?: boolean;
	setActiveToolbarOption: ( toolbarOption: ToolbarOption | null ) => void;
	activeToolbarOption: ToolbarOption | null;
	config: ImageStudioConfig;
	onClassicMediaEditorNavigation?: ( url: string ) => Promise< void >;
	onNavigatePrevious?: () => void;
	onNavigateNext?: () => void;
	hasPreviousImage?: boolean;
	hasNextImage?: boolean;
}

export const Header = ( {
	leftContent,
	isSaveable = true,
	isSaving = false,
	mode,
	onSave,
	onClose,
	onAnnotationUndo,
	onAnnotationRedo,
	setActiveToolbarOption,
	activeToolbarOption,
	config,
	hasPendingAnnotations,
	hasUndoneAnnotations,
	onClassicMediaEditorNavigation,
	onNavigatePrevious,
	onNavigateNext,
	hasPreviousImage = false,
	hasNextImage = false,
}: HeaderProps ) => {
	const { isAiProcessing, hasUpdatedMetadata, isAnnotationMode, hasDrafts } = useSelect(
		( select ) => {
			const selectors = select( imageStudioStore ) as any;
			return {
				isAiProcessing: selectors.getImageStudioAiProcessing(),
				hasUpdatedMetadata: selectors.getHasUpdatedMetadata(),
				isAnnotationMode: selectors.getIsAnnotationMode(),
				hasDrafts: selectors.getDraftIds().length > 0,
			};
		},
		[]
	);

	const { setAnnotationMode, addNotice } = useDispatch( imageStudioStore ) as ImageStudioActions;

	const handleToolbarClick = ( toolbarOption: ToolbarOption ) => {
		const newActiveOption = toolbarOption === activeToolbarOption ? null : toolbarOption;

		setActiveToolbarOption( newActiveOption );

		if ( toolbarOption === ToolbarOption.Annotate ) {
			setAnnotationMode( newActiveOption === ToolbarOption.Annotate );
		} else {
			setAnnotationMode( false );
		}
	};

	// Keep the toolbar option in sync with the annotation mode when enabled from elsewhere
	useEffect( () => {
		if ( isAnnotationMode && activeToolbarOption !== ToolbarOption.Annotate ) {
			setActiveToolbarOption( ToolbarOption.Annotate );
		} else if ( ! isAnnotationMode && activeToolbarOption === ToolbarOption.Annotate ) {
			setActiveToolbarOption( null );
		}
	}, [ isAnnotationMode, activeToolbarOption, setActiveToolbarOption ] );

	const showTools = mode === ImageStudioMode.Edit;
	const showTitle = mode === ImageStudioMode.Generate;
	// Always show navigation pill in Edit mode if we have a filename to display
	const showNavigationPill = mode === ImageStudioMode.Edit && !! config?.imageData?.filename;

	// Generate classic editor URL if we have an attachment ID
	const classicEditorUrl = config?.attachmentId
		? `post.php?post=${ config.attachmentId }&action=edit`
		: null;

	const modKeySymbol = isAppleOS() ? '⌘' : '^';
	const isNavDisabled = hasDrafts || isAiProcessing || isSaving;

	// Get entry point from store with fallback for navigation
	const entryPoint = useSelect(
		( select ) => select( imageStudioStore ).getEntryPoint() as ImageStudioEntryPoint | null,
		[]
	);

	// Helper function to get save button text based on entry point
	const getSaveButtonText = ( currentEntryPoint: ImageStudioEntryPoint | null ): string => {
		const effectiveEntryPoint = currentEntryPoint || ImageStudioEntryPoint.MediaLibrary;

		switch ( effectiveEntryPoint ) {
			case ImageStudioEntryPoint.EditorBlock:
			case ImageStudioEntryPoint.EditorSidebar:
			case ImageStudioEntryPoint.JetpackExternalMediaBlock:
			case ImageStudioEntryPoint.JetpackExternalMediaFeaturedImage:
				return __( 'Save & Apply', __i18n_text_domain__ );
			case ImageStudioEntryPoint.MediaLibrary:
			default:
				return __( 'Save', __i18n_text_domain__ );
		}
	};

	// Helper function to get save button label based on entry point
	const getSaveButtonLabel = ( currentEntryPoint: ImageStudioEntryPoint | null ): string => {
		const effectiveEntryPoint = currentEntryPoint || ImageStudioEntryPoint.MediaLibrary;

		switch ( effectiveEntryPoint ) {
			case ImageStudioEntryPoint.EditorBlock:
			case ImageStudioEntryPoint.EditorSidebar:
			case ImageStudioEntryPoint.JetpackExternalMediaBlock:
			case ImageStudioEntryPoint.JetpackExternalMediaFeaturedImage:
				return __( 'Save and apply image', __i18n_text_domain__ );
			case ImageStudioEntryPoint.MediaLibrary:
			default:
				return __( 'Save displayed image to Media Library', __i18n_text_domain__ );
		}
	};

	let navButtonDisabledTooltip: string | undefined;
	if ( hasDrafts || hasUpdatedMetadata ) {
		navButtonDisabledTooltip = __( 'Save or discard your changes', __i18n_text_domain__ );
	}

	useKeyboardShortcut( 'mod+z', () => onAnnotationUndo?.(), {
		isDisabled: ! isAnnotationMode || ! hasPendingAnnotations,
	} );

	useKeyboardShortcut( 'mod+shift+z', () => onAnnotationRedo?.(), {
		isDisabled: ! isAnnotationMode || ! hasUndoneAnnotations,
	} );

	useKeyboardShortcut(
		'mod+left',
		( event ) => {
			event.preventDefault();
			event.stopPropagation();

			if ( ! hasPreviousImage || isNavDisabled ) {
				return;
			}

			onNavigatePrevious?.();
		},
		{
			bindGlobal: true,
		}
	);

	useKeyboardShortcut(
		'mod+right',
		( event ) => {
			event.preventDefault();
			event.stopPropagation();

			if ( ! hasNextImage || isNavDisabled ) {
				return;
			}

			onNavigateNext?.();
		},
		{
			bindGlobal: true,
		}
	);

	return (
		<div className="image-studio-header">
			<div className="image-studio-header__inner">
				<div className="image-studio-header__left">
					{ leftContent ? (
						leftContent
					) : (
						<h2
							className={ cn( 'components-modal__header-heading', 'image-studio-header__title', {
								'image-studio-sr-only': showTitle,
							} ) }
						>
							{ __( 'Image Editor', __i18n_text_domain__ ) }{ ' ' }
							<span className="image-studio-badge">{ __( 'Beta', __i18n_text_domain__ ) }</span>
						</h2>
					) }
				</div>

				{ showNavigationPill && (
					<div className="image-studio-header__center">
						<div className="image-studio-header__navigation-pill">
							<Button
								variant="tertiary"
								icon={ chevronLeft }
								onClick={ onNavigatePrevious }
								disabled={ ! hasPreviousImage || isNavDisabled }
								label={
									navButtonDisabledTooltip ||
									sprintf(
										/* translators: %s: modifier key (command or control) */
										__( 'Previous image %s←', __i18n_text_domain__ ),
										modKeySymbol
									)
								}
								showTooltip
								accessibleWhenDisabled={ !! navButtonDisabledTooltip }
								className="image-studio-header__nav-button"
							/>
							<span className="image-studio-header__filename">
								{ config?.imageData?.filename || __( 'Untitled', __i18n_text_domain__ ) }
							</span>
							<Button
								variant="tertiary"
								icon={ chevronRight }
								onClick={ onNavigateNext }
								disabled={ ! hasNextImage || isNavDisabled }
								label={
									navButtonDisabledTooltip ||
									sprintf(
										/* translators: %s: modifier key (command or control) */
										__( 'Next image %s→', __i18n_text_domain__ ),
										modKeySymbol
									)
								}
								showTooltip
								accessibleWhenDisabled={ !! navButtonDisabledTooltip }
								className="image-studio-header__nav-button"
							/>
						</div>
					</div>
				) }

				<div className="image-studio-header__right">
					{ showTools && (
						<Fragment>
							{ isAnnotationMode && (
								<div className="image-studio-header__toolbar-group">
									<Button
										variant="tertiary"
										icon={ undo }
										onClick={ () => onAnnotationUndo?.() }
										label={ sprintf(
											/* translators: %s: modifier key (command or control) */
											__( 'Undo %sZ', __i18n_text_domain__ ),
											modKeySymbol
										) }
										disabled={ ! hasPendingAnnotations }
									/>
									<Button
										variant="tertiary"
										icon={ redo }
										onClick={ () => onAnnotationRedo?.() }
										label={ sprintf(
											/* translators: %s: modifier key (command or control) */
											__( 'Redo ⇧%sZ', __i18n_text_domain__ ),
											modKeySymbol
										) }
										disabled={ ! hasUndoneAnnotations }
									/>
								</div>
							) }
							<div className="image-studio-header__toolbar-group">
								{ classicEditorUrl && onClassicMediaEditorNavigation && (
									<Button
										variant="tertiary"
										icon={ external }
										className="image-studio-classic-editor-link"
										label={ __(
											'Edit this image in the WordPress Media Library',
											__i18n_text_domain__
										) }
										onClick={ async () => {
											trackImageStudioToolClick( 'media_library' );
											try {
												await onClassicMediaEditorNavigation( classicEditorUrl );
											} catch ( error ) {
												addNotice(
													__(
														'Failed to save changes. Please try again or use the Save button.',
														__i18n_text_domain__
													),
													'error'
												);
												window.console?.error?.(
													'[Image Studio] Navigation handler error:',
													error
												);
											}
										} }
									>
										<span className="image-studio-header__button-text">
											{ __( 'Media Library', __i18n_text_domain__ ) }
										</span>
									</Button>
								) }
								<Button
									variant="tertiary"
									icon={ <Icon icon={ LassoIcon } /> }
									label={ __( 'Select an area of the image to edit', __i18n_text_domain__ ) }
									onClick={ () => {
										trackImageStudioToolClick( 'annotate' );
										handleToolbarClick( ToolbarOption.Annotate );
									} }
									disabled={ isAiProcessing }
									isPressed={ activeToolbarOption === ToolbarOption.Annotate }
								>
									<span className="image-studio-header__button-text">
										{ __( 'Select', __i18n_text_domain__ ) }
									</span>
								</Button>
								<Button
									variant="tertiary"
									className={ cn( {
										'image-studio-toolbar-alt-button': hasUpdatedMetadata,
									} ) }
									icon={ <Icon icon={ AltIcon } /> }
									label={ __( 'View or edit information about the image', __i18n_text_domain__ ) }
									onClick={ () => {
										// Track whether we're opening or closing
										const isCurrentlyOpen = activeToolbarOption === ToolbarOption.AltText;
										trackImageStudioToolClick( 'alt_text', isCurrentlyOpen ? 'close' : 'open' );
										handleToolbarClick( ToolbarOption.AltText );
									} }
									disabled={ isAiProcessing }
									isPressed={ activeToolbarOption === ToolbarOption.AltText }
								>
									<span className="image-studio-header__button-text">
										{ __( 'Image Info', __i18n_text_domain__ ) }
									</span>
								</Button>
							</div>
							<Button
								variant="primary"
								disabled={ ! isSaveable || isSaving }
								isBusy={ isSaving }
								onClick={ onSave }
								label={ getSaveButtonLabel( entryPoint ) }
								text={
									isSaving ? __( 'Saving…', __i18n_text_domain__ ) : getSaveButtonText( entryPoint )
								}
							/>
						</Fragment>
					) }
					<Button
						icon={ <Icon icon={ close } /> }
						label={ __( 'Close image editor', __i18n_text_domain__ ) }
						onClick={ () => onClose() }
						disabled={ isSaving }
					/>
				</div>
			</div>
		</div>
	);
};
