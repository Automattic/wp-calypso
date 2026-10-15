/**
 * Applies deterministic image edits (rotate, flip) with WordPress core's
 * `POST /wp/v2/media/<id>/edit` route and shows the new attachment as a draft, with no model call.
 */
import apiFetch from '@wordpress/api-fetch';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as imageStudioStore } from '../store';
import { getImageEditModifiers } from '../utils/image-edit-modifiers';
import type { ImageStudioActions } from '../store';
import type { ImageTransform } from '../utils/image-edit-modifiers';

interface EditedAttachmentResponse {
	id: number;
	source_url: string;
}

export function useTransform() {
	const {
		addNotice,
		setDraftIds,
		addTransformedAttachmentId,
		updateImageStudioCanvas,
		setImageStudioOriginalImageUrl,
		setImageStudioAiProcessing,
	} = useDispatch( imageStudioStore ) as ImageStudioActions;

	const { attachmentId, imageUrl, draftIds, canvasMetadata } = useSelect( ( select ) => {
		const selectors = select( imageStudioStore );
		return {
			attachmentId: selectors.getImageStudioAttachmentId() ?? selectors.getOriginalAttachmentId(),
			imageUrl:
				selectors.getImageStudioCurrentImageUrl() ?? selectors.getImageStudioOriginalImageUrl(),
			draftIds: selectors.getDraftIds(),
			canvasMetadata: selectors.getCanvasMetadata(),
		};
	}, [] );

	const applyImageTransform = useCallback(
		async ( transform: ImageTransform ) => {
			if ( ! attachmentId || ! imageUrl ) {
				addNotice(
					__( 'Could not edit the image. Please try again.', __i18n_text_domain__ ),
					'error'
				);
				return;
			}

			// Core copies metadata from the source attachment; send the canvas values so unsaved
			// sidebar edits carry over too, as update-canvas-image does for AI edits.
			const metadata = Object.fromEntries(
				Object.entries( canvasMetadata ?? {} ).filter( ( [ , value ] ) => !! value )
			);

			setImageStudioAiProcessing( { source: 'transform', value: true } );
			try {
				const media = await apiFetch< EditedAttachmentResponse >( {
					path: `/wp/v2/media/${ attachmentId }/edit`,
					method: 'POST',
					data: {
						src: imageUrl,
						modifiers: getImageEditModifiers( transform ),
						...metadata,
					},
				} );

				if ( ! media?.id || ! media?.source_url ) {
					throw new Error( 'Image edit succeeded but returned no image.' );
				}

				await setDraftIds( [ ...new Set( [ ...draftIds, media.id ] ) ] );
				await addTransformedAttachmentId( media.id );
				await updateImageStudioCanvas( media.source_url, media.id, false );
				await setImageStudioOriginalImageUrl( media.source_url );
			} catch ( error ) {
				window.console?.error?.( error );
				addNotice(
					__( 'Could not edit the image. Please try again.', __i18n_text_domain__ ),
					'error'
				);
			} finally {
				setImageStudioAiProcessing( { source: 'transform', value: false } );
			}
		},
		[
			attachmentId,
			imageUrl,
			draftIds,
			canvasMetadata,
			addNotice,
			addTransformedAttachmentId,
			setDraftIds,
			setImageStudioAiProcessing,
			setImageStudioOriginalImageUrl,
			updateImageStudioCanvas,
		]
	);

	return { applyImageTransform };
}
