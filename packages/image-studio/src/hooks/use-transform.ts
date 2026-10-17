/**
 * Applies deterministic image edits (rotate, flip) with WordPress core's
 * `POST /wp/v2/media/<id>/edit` route and shows the new attachment as a draft, with no model call.
 */
import apiFetch from '@wordpress/api-fetch';
import { store as coreStore } from '@wordpress/core-data';
import { select, useDispatch } from '@wordpress/data';
import { useCallback, useEffect, useRef } from '@wordpress/element';
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

const getSelectors = () => select( imageStudioStore ) as unknown as CurriedImageStudioSelectors;

export function useTransform() {
	const isTransformingRef = useRef( false );
	// The modal unmounts on close, so this instance belongs to one open session.
	const isMountedRef = useRef( true );
	useEffect( () => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, [] );

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
			const selectors = getSelectors();
			const attachmentId =
				selectors.getImageStudioAttachmentId() ?? selectors.getOriginalAttachmentId();
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
			// sidebar edits, including cleared fields, carry over. An empty title would blank the
			// new attachment's title instead of falling back, so title is only sent when set.
			const canvasMetadata = selectors.getCanvasMetadata();
			const metadata = canvasMetadata
				? {
						...( canvasMetadata.title ? { title: canvasMetadata.title } : {} ),
						caption: canvasMetadata.caption ?? '',
						description: canvasMetadata.description ?? '',
						alt_text: canvasMetadata.alt_text ?? '',
					}
				: {};

			// Image Studio is closing or was closed while the request ran.
			const isSessionOver = () => ! isMountedRef.current || getSelectors().getIsExitConfirmed();

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

				// Exit cleanup has already run or is running, so nothing else would delete this.
				if ( isSessionOver() ) {
					try {
						await deleteEntityRecord(
							'postType',
							'attachment',
							media.id,
							{ force: true },
							{ throwOnError: true }
						);
					} catch ( error ) {
						window.console?.error?.( '[Image Studio] Failed to delete edited image:', error );
						trackImageStudioError( {
							mode: ImageStudioMode.Edit,
							errorType: 'draft_cleanup_failed',
							attachmentId: media.id,
						} );
					}
					return;
				}

				await setDraftIds( [ ...new Set( [ ...getSelectors().getDraftIds(), media.id ] ) ] );
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
				if ( ! isSessionOver() ) {
					// Core accepts the flip modifier from WordPress 6.9.
					const isFlipUnsupported =
						transform.type === 'flip' &&
						( error as { code?: string } )?.code === 'rest_invalid_param';
					addNotice(
						isFlipUnsupported
							? __(
									"This site's WordPress version can't flip images. Update WordPress to flip.",
									__i18n_text_domain__
								)
							: __( 'Could not edit the image. Please try again.', __i18n_text_domain__ ),
						'error'
					);
				}
			} finally {
				isTransformingRef.current = false;
				// After a close, the store may belong to a newer session with its own processing state.
				if ( ! isSessionOver() ) {
					setImageStudioAiProcessing( { source: 'transform', value: false } );
				}
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
