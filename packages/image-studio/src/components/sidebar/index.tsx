import { Button, Icon } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { close, external } from '@wordpress/icons';
import { store as imageStudioStore } from '../../store';
import { MetadataField } from '../../types';
import {
	trackImageStudioMetadataUpdated,
	trackImageStudioSidebarClose,
} from '../../utils/tracking';
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
						label={ __( 'Close sidebar', 'big-sky' ) }
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
}

export function ImageStudioAltTextSidebar( { onClose }: ImageStudioAltTextSidebarProps ) {
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
		<ImageStudioSidebar onClose={ onClose } title={ __( 'Image Info', 'big-sky' ) }>
			<EditableField
				label={ __( 'Title', 'big-sky' ) }
				value={ canvasMetadata?.title || '' }
				onSave={ ( value ) => handleSave( MetadataField.Title, value ) }
				field={ MetadataField.Title }
				attachmentId={ normalizedAttachmentId }
			/>
			<EditableField
				label={ __( 'Caption', 'big-sky' ) }
				value={ canvasMetadata?.caption || '' }
				onSave={ ( value ) => handleSave( MetadataField.Caption, value ) }
				isTextarea
				field={ MetadataField.Caption }
				attachmentId={ normalizedAttachmentId }
			/>
			<EditableField
				label={ __( 'Description', 'big-sky' ) }
				value={ canvasMetadata?.description || '' }
				onSave={ ( value ) => handleSave( MetadataField.Description, value ) }
				isTextarea
				field={ MetadataField.Description }
				attachmentId={ normalizedAttachmentId }
			/>
			<EditableField
				label={ __( 'Alt Text', 'big-sky' ) }
				value={ canvasMetadata?.alt_text || '' }
				onSave={ ( value ) => handleSave( MetadataField.AltText, value ) }
				isTextarea
				field={ MetadataField.AltText }
				attachmentId={ normalizedAttachmentId }
			/>
			<p className="image-studio-alt-text-sidebar__help-text">
				{ __(
					"Alt text describes the image's purpose. Leave it blank if the image is purely decorative.",
					'big-sky'
				) }{ ' ' }
				<a
					href="https://www.w3.org/WAI/tutorials/images/decision-tree/"
					target="_blank"
					rel="noreferrer noopener"
					className="image-studio-alt-text-sidebar__learn-more-link"
				>
					{ __( 'Learn more', 'big-sky' ) }
					<Icon icon={ external } size={ 16 } />
				</a>
			</p>
			{ attachmentId && <FileDetails attachmentId={ attachmentId } /> }
		</ImageStudioSidebar>
	);
}
