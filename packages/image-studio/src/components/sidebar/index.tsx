import { Button, Icon } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { close, external } from '@wordpress/icons';
import { store as imageStudioStore } from '../../store';
import { MetadataField } from '../../types';
import {
	trackImageStudioMetadataUpdated,
	trackImageStudioSidebarClose,
} from '../../utils/tracking';
import { ConfirmationDialog } from '../confirmation-dialog';
import { EditableField } from './editable-field';
import { FileDetails } from './file-details';
import './style.scss';

interface ImageStudioSidebarProps {
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

export function ImageStudioSidebar( { onClose, title, children }: ImageStudioSidebarProps ) {
	const handleClose = () => {
		trackImageStudioSidebarClose();
		onClose();
	};

	return (
		<div className="image-studio-sidebar">
			<div className="image-studio-sidebar__header">
				<div className="image-studio-sidebar__header-inner">
					<h2>{ title }</h2>
					<Button
						icon={ <Icon icon={ close } /> }
						label={ __( 'Close sidebar', __i18n_text_domain__ ) }
						onClick={ handleClose }
					/>
				</div>
			</div>
			<div className="image-studio-sidebar__content">{ children }</div>
		</div>
	);
}

interface ImageStudioAltTextSidebarProps {
	onClose: () => void;
	onDeletePermanently?: () => Promise< void >;
	canDeletePermanently?: boolean;
}

export function ImageStudioAltTextSidebar( {
	onClose,
	onDeletePermanently,
	canDeletePermanently,
}: ImageStudioAltTextSidebarProps ) {
	const [ isDeleteDialogOpen, setIsDeleteDialogOpen ] = useState( false );

	let deletePermanentlyDisabledTooltip: string | undefined;
	if ( ! canDeletePermanently ) {
		deletePermanentlyDisabledTooltip = __( 'Save or discard your changes', 'big-sky' );
	}

	const attachmentId = useSelect(
		( select ) => select( imageStudioStore ).getImageStudioAttachmentId(),
		[]
	);
	const normalizedAttachmentId = attachmentId ?? undefined;

	const { setHasUpdatedMetadata, setCanvasMetadata } = useDispatch( imageStudioStore ) as any;

	const canvasMetadata = useSelect(
		( select ) => select( imageStudioStore ).getCanvasMetadata() || {},
		[]
	);

	const handleSave = async ( key: MetadataField, value: string ) => {
		if ( ! attachmentId ) {
			return;
		}

		const metadataPayload = {
			...( canvasMetadata || {} ),
			[ key ]: value,
		};

		setCanvasMetadata( metadataPayload );
		setHasUpdatedMetadata( true );

		// Track the metadata update
		trackImageStudioMetadataUpdated( {
			attachmentId,
			field: key,
		} );
	};

	return (
		<ImageStudioSidebar onClose={ onClose } title={ __( 'Image Info', __i18n_text_domain__ ) }>
			<EditableField
				label={ __( 'Title', __i18n_text_domain__ ) }
				value={ canvasMetadata?.title || '' }
				onSave={ ( value ) => handleSave( MetadataField.Title, value ) }
				field={ MetadataField.Title }
				attachmentId={ normalizedAttachmentId }
			/>
			<EditableField
				label={ __( 'Caption', __i18n_text_domain__ ) }
				value={ canvasMetadata?.caption || '' }
				onSave={ ( value ) => handleSave( MetadataField.Caption, value ) }
				isTextarea
				field={ MetadataField.Caption }
				attachmentId={ normalizedAttachmentId }
			/>
			<EditableField
				label={ __( 'Description', __i18n_text_domain__ ) }
				value={ canvasMetadata?.description || '' }
				onSave={ ( value ) => handleSave( MetadataField.Description, value ) }
				isTextarea
				field={ MetadataField.Description }
				attachmentId={ normalizedAttachmentId }
			/>
			<EditableField
				label={ __( 'Alt Text', __i18n_text_domain__ ) }
				value={ canvasMetadata?.alt_text || '' }
				onSave={ ( value ) => handleSave( MetadataField.AltText, value ) }
				isTextarea
				field={ MetadataField.AltText }
				attachmentId={ normalizedAttachmentId }
			/>
			<p className="image-studio-alt-text-sidebar__help-text">
				{ __(
					"Alt text describes the image's purpose. Leave it blank if the image is purely decorative.",
					__i18n_text_domain__
				) }{ ' ' }
				<a
					href="https://www.w3.org/WAI/tutorials/images/decision-tree/"
					target="_blank"
					rel="noreferrer noopener"
					className="image-studio-alt-text-sidebar__learn-more-link"
				>
					{ __( 'Learn more', __i18n_text_domain__ ) }
					<Icon icon={ external } size={ 16 } />
				</a>
			</p>
			{ attachmentId && <FileDetails attachmentId={ attachmentId } /> }
			{ onDeletePermanently && (
				<>
					<Button
						variant="link"
						isDestructive
						disabled={ ! canDeletePermanently }
						label={ deletePermanentlyDisabledTooltip || __( 'Delete permanently', 'big-sky' ) }
						showTooltip
						accessibleWhenDisabled={ !! deletePermanentlyDisabledTooltip }
						onClick={ () => setIsDeleteDialogOpen( true ) }
					>
						{ __( 'Delete permanently', 'big-sky' ) }
					</Button>
					{ isDeleteDialogOpen && (
						<ConfirmationDialog
							isOpen={ isDeleteDialogOpen }
							onClose={ () => setIsDeleteDialogOpen( false ) }
							title={ __( 'Delete this item', 'big-sky' ) }
							actions={ [
								{
									text: __( 'Cancel', 'big-sky' ),
									onClick: () => setIsDeleteDialogOpen( false ),
									variant: 'secondary',
								},
								{
									text: __( 'Delete permanently', 'big-sky' ),
									onClick: async () => {
										// Close dialog first to prevent interaction during deletion
										// The exit overlay will appear once deletion starts
										setIsDeleteDialogOpen( false );
										// Note: Don't set state after this - onDeletePermanently
										// triggers onExit() which unmounts this component
										await onDeletePermanently();
									},
									variant: 'primary',
									isDestructive: true,
								},
							] }
						>
							{ __(
								'You are about to permanently delete this item from your site. This action cannot be undone.',
								'big-sky'
							) }
						</ConfirmationDialog>
					) }
				</>
			) }
		</ImageStudioSidebar>
	);
}
