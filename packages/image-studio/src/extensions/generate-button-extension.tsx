import { useBlockEditContext } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { dispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ImageStudioEntryPoint, store as imageStudioStore } from '../store';
import { ImageStudioMode } from '../types';
import { type ImageData } from '../utils/get-image-data';
import { trackImageStudioOpened } from '../utils/tracking';
import { handleImageSelection } from './utils';

export const withImageStudioGenerateButton = createHigherOrderComponent(
	( OriginalComponent: React.ComponentType< any > ) => {
		// This logic is copied from Jetpack's external media plugin.
		const isFeaturedImage = ( props: any ) =>
			props.unstableFeaturedImageFlow ||
			( props.modalClass && props.modalClass.indexOf( 'featured-image' ) !== -1 );

		// These are the same blocks that Jetpack's MediaAiButton component renders for.
		// https://github.com/Automattic/jetpack/blob/trunk/projects/packages/external-media/src/shared/media-button/index.js
		const isAllowedBlock = ( name: string ) => {
			const allowedBlocks = [ 'core/image', 'core/gallery', 'jetpack/slideshow' ];

			return allowedBlocks.includes( name );
		};

		const ImageStudioGenerateButton = ( props: any ) => {
			const { name } = useBlockEditContext();
			const { render: originalRenderProp, ...rest } = props;
			const { onSelect, multiple } = rest;
			let render = originalRenderProp;
			const { openImageStudio } = dispatch( imageStudioStore );

			const handleClose = useCallback(
				( image: ImageData ) => {
					handleImageSelection( {
						image,
						onSelect,
						multiple,
					} );
				},
				[ onSelect, multiple ]
			);

			const handleOpen = () => {
				openImageStudio( undefined, handleClose, ImageStudioEntryPoint.EditorBlock );

				trackImageStudioOpened( {
					mode: ImageStudioMode.Edit,
					attachmentId: undefined,
					entryPoint: ImageStudioEntryPoint.EditorBlock,
				} );
			};

			if ( props?.mode === 'browse' && isAllowedBlock( name ) && ! isFeaturedImage( props ) ) {
				const { allowedTypes, gallery = false, value = [] } = props;

				// Only replace button for components that expect images, except existing galleries.
				if ( allowedTypes.includes( 'image' ) && ! ( gallery && value.length > 0 ) ) {
					const originalRender = render;

					render = ( button: React.ReactNode ) => {
						const mediaButton = originalRender( button );
						return (
							<>
								{ mediaButton }
								<Button
									variant="secondary"
									className="big-sky-image-studio-generate-button"
									__next40pxDefaultSize
									onClick={ handleOpen }
								>
									{ __( 'Generate Image', 'big-sky' ) }
								</Button>
							</>
						);
					};
				}
			}

			return <OriginalComponent { ...rest } render={ render } />;
		};

		ImageStudioGenerateButton.displayName = 'ImageStudioGenerateButton';

		return ImageStudioGenerateButton;
	},
	'withImageStudioGenerateButton'
);
