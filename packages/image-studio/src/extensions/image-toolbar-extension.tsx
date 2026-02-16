import { BlockControls } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { store as coreStore } from '@wordpress/core-data';
import { dispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ImageStudioEntryPoint, store as imageStudioStore } from '../store/index';
import { IMAGE_STUDIO_SUPPORTED_MIME_TYPES, ImageStudioMode } from '../types';
import { type ImageData } from '../utils/get-image-data';
import { trackImageStudioOpened } from '../utils/tracking';

/**
 * Add Image Studio button to image blocks toolbar
 */
export const withImageStudioToolbarButton = createHigherOrderComponent(
	( BlockEdit: React.ComponentType< any > ) => {
		const ImageStudioToolbarButton = ( props: any ) => {
			const { openImageStudio } = dispatch( imageStudioStore );
			const { attributes, setAttributes } = props;

			// Get supported MIME types
			const supportedMimeTypes: readonly string[] = IMAGE_STUDIO_SUPPORTED_MIME_TYPES;

			// Fetch the attachment MIME type from the media store
			const media = useSelect(
				( select ) => {
					if ( ! attributes?.id ) {
						return null;
					}
					return select( coreStore ).getEntityRecord( 'postType', 'attachment', attributes.id );
				},
				[ attributes?.id ]
			);

			const handleClose = useCallback(
				( image: ImageData ) => {
					if ( image?.id ) {
						setAttributes( {
							url: image.url,
							id: image.id,
							alt: image.alt,
							description: image.description,
							title: image.title,
						} );
					}
				},
				[ setAttributes ]
			);

			const handleEditClick = useCallback( () => {
				trackImageStudioOpened( {
					mode: ImageStudioMode.Edit,
					attachmentId: attributes.id,
					entryPoint: ImageStudioEntryPoint.EditorBlock,
				} );
				openImageStudio( attributes.id, handleClose, ImageStudioEntryPoint.EditorBlock );
			}, [ attributes, handleClose, openImageStudio ] );

			if ( props.name !== 'core/image' || ! attributes?.id ) {
				return <BlockEdit { ...props } />;
			}

			// Check if image MIME type is supported
			const imageMimeType = media?.mime_type;
			if ( imageMimeType && ! supportedMimeTypes.includes( imageMimeType ) ) {
				return <BlockEdit { ...props } />;
			}

			return (
				<>
					<BlockEdit { ...props } />
					<BlockControls group="default">
						<ToolbarGroup>
							<ToolbarButton
								label={ __( 'Edit image with AI', 'big-sky' ) }
								onClick={ handleEditClick }
							>
								{ __( 'Edit', 'big-sky' ) }
							</ToolbarButton>
						</ToolbarGroup>
					</BlockControls>
				</>
			);
		};

		ImageStudioToolbarButton.displayName = 'ImageStudioToolbarButton';

		return ImageStudioToolbarButton;
	},
	'withImageStudioToolbarButton'
);
