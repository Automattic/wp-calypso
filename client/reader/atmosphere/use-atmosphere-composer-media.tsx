/**
 * Atmosphere implementation of the shared `ComposerMediaSlot`. Wraps
 * `useImageUploads` (the per-image state machine — `compressing → uploading
 * → uploaded`, with `failed` as the off-ramp), exposes its flags through the
 * slot, owns the file-picker UI rendered into the modal's footer slot, and
 * the grid of preview thumbnails rendered between the textarea and the error
 * region.
 *
 * Called from `<ComposerProvider>` (NOT the modal): media state must outlast
 * the modal's mount lifetime, since `clearAll({ deferRevocation: true })`
 * keeps preview blob URLs alive for ~60s past close so the local-preview
 * embed cache patch (`setAtmospherePostEmbed`) outlasts the timeline /
 * author-feed staleTime.
 */

import { setAtmospherePostEmbed } from '@automattic/api-queries';
import { Icon, image as imageIcon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { MediaGrid } from 'calypso/reader/social/composer-media';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGES } from './composer-media/constants';
import { getMediaErrorMessage } from './composer-media/error-copy';
import { useImageUploads } from './composer-media/use-image-uploads';
import type { ComposerImage } from './composer-media/types';
import type {
	AtmosphereEmbedImages,
	CreatePostParams,
	CreatePostResult,
} from '@automattic/api-core';
import type { ActiveMode, ComposerMediaSlot } from 'calypso/reader/social/composer';
import type { AppState } from 'calypso/types';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

interface Ctx {
	mode: ActiveMode | null;
	connectionId: number;
}

export function useAtmosphereComposerMedia( { mode, connectionId }: Ctx ): ComposerMediaSlot {
	const translate = useTranslate();
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const onTrack = useCallback(
		( event: string, props: Record< string, unknown > ) => {
			dispatch( recordReaderTracksEvent( event, props ) );
		},
		[ dispatch ]
	);

	const {
		images,
		addFiles,
		removeImage,
		retryImage,
		setAlt,
		clearAll,
		isAllUploaded,
		isAnyPending,
	} = useImageUploads( {
		connectionId,
		max: MAX_IMAGES,
		mode: mode?.kind ?? 'standalone',
		onTrack,
	} );

	const inputRef = useRef< HTMLInputElement | null >( null );
	const atMax = images.length >= MAX_IMAGES;

	const renderGrid = useCallback(
		() => (
			<MediaGrid
				items={ images.map( ( i ) =>
					'previewUrl' in i ? i : { ...i, previewUrl: '', alt: '' }
				) }
				max={ MAX_IMAGES }
				accept={ ACCEPTED_IMAGE_TYPES }
				onPickFiles={ addFiles }
				onRemove={ removeImage }
				onRetry={ retryImage }
				onSetAlt={ setAlt }
				isPending={ ( i ) => i.kind === 'compressing' || i.kind === 'uploading' }
				canEditAlt={ ( i ) => i.kind === 'uploading' || i.kind === 'uploaded' }
				isFailed={ ( i ) => i.kind === 'failed' }
				errorMessage={ ( i ) =>
					i.kind === 'failed' ? getMediaErrorMessage( i.error, translate ) : null
				}
			/>
		),
		[ images, addFiles, removeImage, retryImage, setAlt, translate ]
	);

	const renderFooterTrigger = useCallback(
		() => (
			<>
				<button
					type="button"
					className="social-composer__media"
					aria-disabled={ atMax || undefined }
					aria-label={
						atMax
							? ( translate( 'Maximum %(count)d images', {
									args: { count: MAX_IMAGES },
									comment:
										'Tooltip on the composer "Add media" button when the user has reached the per-post image cap; %(count)d is the maximum number of images allowed on a single post.',
							  } ) as string )
							: ( translate( 'Add media' ) as string )
					}
					onClick={ () => {
						if ( ! atMax ) {
							inputRef.current?.click();
						}
					} }
				>
					<Icon icon={ imageIcon } size={ 18 } />
				</button>
				<input
					ref={ inputRef }
					type="file"
					accept={ ACCEPTED_IMAGE_TYPES }
					multiple
					hidden
					onChange={ ( e ) => {
						const files = Array.from( e.target.files ?? [] );
						if ( files.length > 0 ) {
							addFiles( files );
						}
						// Reset so picking the same file again still triggers onChange.
						e.target.value = '';
					} }
				/>
			</>
		),
		[ atMax, translate, addFiles ]
	);

	const extendBuildParams = useCallback(
		( params: unknown ) => {
			const media = buildMediaParam( images );
			if ( ! media ) {
				return params;
			}
			// `params` is the protocol-specific shape (`CreatePostParams`).
			// The slot is opaque to the modal, so the cast happens here.
			return { ...( params as CreatePostParams ), media };
		},
		[ images ]
	);

	const onPublishSuccess = useCallback(
		(
			queryClient: Parameters< ComposerMediaSlot[ 'onPublishSuccess' ] >[ 0 ],
			result: unknown
		) => {
			// Patch the just-published feed item with a local-preview-URL
			// embed so the timeline / author-feed / thread caches show the
			// user's just-attached images during the brief window before
			// the next refetch replaces them with real CDN URLs from the
			// AppView. The factory's `onSuccess` has already swapped the
			// placeholder for an embed-less realItem; we layer the embed
			// on top here. The `clear({ keepPreviewUrlsAlive: true })`
			// triggered after this defers preview-URL revocation past the
			// timeline staleTime so the local blob URLs remain valid until
			// the cache refetches.
			const localEmbed = buildLocalImagesEmbed( images );
			if ( ! localEmbed ) {
				return;
			}
			const typedResult = result as CreatePostResult;
			setAtmospherePostEmbed( queryClient, typedResult.uri, localEmbed );
		},
		[ images ]
	);

	const clear = useCallback(
		( options: { keepPreviewUrlsAlive: boolean } ) => {
			clearAll( { deferRevocation: options.keepPreviewUrlsAlive } );
		},
		[ clearAll ]
	);

	const hasAny = images.length > 0;
	const hasUploaded = images.some( ( i ) => i.kind === 'uploaded' );

	return useMemo(
		() => ( {
			hasAny,
			hasUploaded,
			isAllUploaded,
			isAnyPending,
			renderGrid,
			renderFooterTrigger,
			extendBuildParams,
			onPublishSuccess,
			clear,
		} ),
		[
			hasAny,
			hasUploaded,
			isAllUploaded,
			isAnyPending,
			renderGrid,
			renderFooterTrigger,
			extendBuildParams,
			onPublishSuccess,
			clear,
		]
	);
}

/**
 * Build the wire-level `media` param from the composer's uploaded images.
 * Returns `undefined` when nothing is uploaded so the caller can skip
 * adding the field entirely (no-op rather than emit an empty `images: []`,
 * which the AppView never produces).
 */
function buildMediaParam(
	images: ComposerImage[]
): NonNullable< CreatePostParams[ 'media' ] > | undefined {
	const uploaded = images.filter(
		( i ): i is Extract< ComposerImage, { kind: 'uploaded' } > => i.kind === 'uploaded'
	);
	if ( uploaded.length === 0 ) {
		return undefined;
	}
	return {
		images: uploaded.map( ( i ) => ( {
			blob: i.blob,
			alt: i.alt,
			aspectRatio: i.aspectRatio,
		} ) ),
	};
}

/**
 * Build an `AtmosphereEmbedImages` from the composer's uploaded images,
 * using each image's local `previewUrl` as both `thumb` and `fullsize`.
 * Returns `null` when nothing is uploaded so the caller can skip the
 * cache patch entirely.
 */
function buildLocalImagesEmbed( images: ComposerImage[] ): AtmosphereEmbedImages | null {
	const uploaded = images.filter(
		( i ): i is Extract< ComposerImage, { kind: 'uploaded' } > => i.kind === 'uploaded'
	);
	if ( uploaded.length === 0 ) {
		return null;
	}
	return {
		type: 'images',
		images: uploaded.map( ( i ) => ( {
			thumb: i.previewUrl,
			fullsize: i.previewUrl,
			alt: i.alt,
			aspect_ratio: i.aspectRatio,
		} ) ),
	};
}
