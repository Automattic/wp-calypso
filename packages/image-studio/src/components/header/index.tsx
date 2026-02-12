import { cn } from '@automattic/agenttic-ui';
import { Button, Icon } from '@wordpress/components';
import { useKeyboardShortcut } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { Fragment, useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { chevronLeft, chevronRight, close, external, redo, undo } from '@wordpress/icons';
import { isAppleOS } from '@wordpress/keycodes';
import { type ImageStudioActions, store as imageStudioStore } from '../../store';
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
	const { isAiProcessing, hasUpdatedMetadata, isAnnotationMode } = useSelect( ( select ) => {
		const selectors = select( imageStudioStore ) as any;
		return {
			isAiProcessing: selectors.getImageStudioAiProcessing(),
			hasUpdatedMetadata: selectors.getHasUpdatedMetadata(),
			isAnnotationMode: selectors.getIsAnnotationMode(),
		};
	}, [] );

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

	useKeyboardShortcut( 'mod+z', () => onAnnotationUndo?.(), {
		isDisabled: ! isAnnotationMode || ! hasPendingAnnotations,
	} );

	useKeyboardShortcut( 'mod+shift+z', () => onAnnotationRedo?.(), {
		isDisabled: ! isAnnotationMode || ! hasUndoneAnnotations,
	} );

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
							{ __( 'Image Editor', 'big-sky' ) }{ ' ' }
							<span className="image-studio-badge">{ __( 'Beta', 'big-sky' ) }</span>
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
								disabled={ ! hasPreviousImage || isAiProcessing || isSaving }
								label={ sprintf(
									/* translators: %s: modifier key (command or control) */
									__( 'Previous image %s←', 'big-sky' ),
									modKeySymbol
								) }
								showTooltip
								className="image-studio-header__nav-button"
							/>
							<span className="image-studio-header__filename">
								{ config?.imageData?.filename || __( 'Untitled', 'big-sky' ) }
							</span>
							<Button
								variant="tertiary"
								icon={ chevronRight }
								onClick={ onNavigateNext }
								disabled={ ! hasNextImage || isAiProcessing || isSaving }
								label={ sprintf(
									/* translators: %s: modifier key (command or control) */
									__( 'Next image %s→', 'big-sky' ),
									modKeySymbol
								) }
								showTooltip
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
											__( 'Undo %sZ', 'big-sky' ),
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
											__( 'Redo ⇧%sZ', 'big-sky' ),
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
										label={ __( 'Edit this image in the WordPress Media Library', 'big-sky' ) }
										onClick={ async () => {
											trackImageStudioToolClick( 'media_library' );
											try {
												await onClassicMediaEditorNavigation( classicEditorUrl );
											} catch ( error ) {
												addNotice(
													__(
														'Failed to save changes. Please try again or use the Save button.',
														'big-sky'
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
											{ __( 'Media Library', 'big-sky' ) }
										</span>
									</Button>
								) }
								<Button
									variant="tertiary"
									icon={ <Icon icon={ LassoIcon } /> }
									label={ __( 'Select an area of the image to edit', 'big-sky' ) }
									onClick={ () => {
										trackImageStudioToolClick( 'annotate' );
										handleToolbarClick( ToolbarOption.Annotate );
									} }
									disabled={ isAiProcessing }
									isPressed={ activeToolbarOption === ToolbarOption.Annotate }
								>
									<span className="image-studio-header__button-text">
										{ __( 'Select', 'big-sky' ) }
									</span>
								</Button>
								<Button
									variant="tertiary"
									className={ cn( {
										'image-studio-toolbar-alt-button': hasUpdatedMetadata,
									} ) }
									icon={ <Icon icon={ AltIcon } /> }
									label={ __( 'View or edit information about the image', 'big-sky' ) }
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
										{ __( 'Image Info', 'big-sky' ) }
									</span>
								</Button>
							</div>
							<Button
								variant="primary"
								disabled={ ! isSaveable || isSaving }
								isBusy={ isSaving }
								onClick={ onSave }
								label={ __( 'Save displayed image to Media Library', 'big-sky' ) }
								text={ isSaving ? __( 'Saving…', 'big-sky' ) : __( 'Save', 'big-sky' ) }
							/>
						</Fragment>
					) }
					<Button
						icon={ <Icon icon={ close } /> }
						label={ __( 'Close image editor', 'big-sky' ) }
						onClick={ () => onClose() }
						disabled={ isSaving }
					/>
				</div>
			</div>
		</div>
	);
};
