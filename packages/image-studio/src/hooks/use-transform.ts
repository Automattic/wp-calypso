/**
 * Applies deterministic image edits (rotate, flip) with WordPress core's
 * `POST /wp/v2/media/<id>/edit` route and shows the new attachment as a draft, with no model call.
 */
import apiFetch from '@wordpress/api-fetch';
import { store as coreStore } from '@wordpress/core-data';
import { select, useDispatch } from '@wordpress/data';
import { useCallback, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as imageStudioStore } from '../store';
import { ImageStudioMode } from '../types';
import { getImageEditModifiers } from '../utils/image-edit-modifiers';
import { trackImageStudioError } from '../utils/tracking';
import type { ImageStudioActions } from '../store';
import type { CurriedImageStudioSelectors } from '../types/wordpress';
import type { ImageTransform } from '../utils/image-edit-modifiers';

interface EditedAttachmentResponse {
	id: number;
	source_url: string;
}

export function useTransform() {
	const isTransformingRef = useRef( false );

	const {
		addNotice,
		setDraftIds,
		addTransformedAttachmentId,
		updateImageStudioCanvas,
		setImageStudioOriginalImageUrl,
		setImageStudioAiProcessing,
	} = useDispatch( imageStudioStore ) as ImageStudioActions;
	const { deleteEntityRecord } = useDispatch( coreStore ) as {
		deleteEntityRecord: (
			kind: string,
			name: string,
			id: number,
			query?: Record< string, unknown >,
			options?: { throwOnError?: boolean }
		) => Promise< void >;
	};

	const applyImageTransform = useCallback(
		async ( transform: ImageTransform ) => {
			if ( isTransformingRef.current ) {
				return;
			}

			// Read at call time so a click right after another edit uses the latest image.
			const selectors = select( imageStudioStore ) as unknown as CurriedImageStudioSelectors;
			const originalAttachmentId = selectors.getOriginalAttachmentId();
			const attachmentId = selectors.getImageStudioAttachmentId() ?? originalAttachmentId;
			const imageUrl =
				selectors.getImageStudioCurrentImageUrl() ?? selectors.getImageStudioOriginalImageUrl();

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
				Object.entries( selectors.getCanvasMetadata() ?? {} ).filter( ( [ , value ] ) => !! value )
			);

			isTransformingRef.current = true;
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

				// Image Studio closed (and cleaned up its drafts) while the request ran,
				// so nothing would track or delete this attachment.
				const current = select( imageStudioStore ) as unknown as CurriedImageStudioSelectors;
				if (
					! current.getIsImageStudioOpen() ||
					current.getOriginalAttachmentId() !== originalAttachmentId
				) {
					await deleteEntityRecord( 'postType', 'attachment', media.id, { force: true } );
					return;
				}

				await setDraftIds( [ ...new Set( [ ...current.getDraftIds(), media.id ] ) ] );
				await addTransformedAttachmentId( media.id );
				await updateImageStudioCanvas( media.source_url, media.id, false );
				await setImageStudioOriginalImageUrl( media.source_url );
			} catch ( error ) {
				window.console?.error?.( error );
				trackImageStudioError( {
					mode: ImageStudioMode.Edit,
					errorType: 'transform_failed',
					attachmentId,
				} );
				addNotice(
					__( 'Could not edit the image. Please try again.', __i18n_text_domain__ ),
					'error'
				);
			} finally {
				isTransformingRef.current = false;
				setImageStudioAiProcessing( { source: 'transform', value: false } );
			}
		},
		[
			addNotice,
			addTransformedAttachmentId,
			deleteEntityRecord,
			setDraftIds,
			setImageStudioAiProcessing,
			setImageStudioOriginalImageUrl,
			updateImageStudioCanvas,
		]
	);

	return { applyImageTransform };
}
