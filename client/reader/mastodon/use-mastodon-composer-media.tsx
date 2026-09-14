/**
 * Mastodon implementation of the shared `ComposerMediaSlot`. Wraps
 * `useStagedImages` (the per-image state machine — `staged | failed`),
 * exposes its flags through the slot, and uploads all staged images at
 * publish time inside `extendBuildParams`.
 *
 * Called from `<ComposerProvider>` (NOT the modal): media state must outlast
 * the modal's mount lifetime so a publish-error doesn't lose the staged
 * images. Mastodon does not need atmosphere's deferred preview-URL
 * revocation — the `POST /statuses` response already includes real CDN URLs
 * from the instance, so there's no AppView lag window for the cache to
 * patch over.
 */

import { Icon, image as imageIcon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useRef } from 'react';
import { MediaGrid } from 'calypso/reader/social/composer-media';
import {
	ACCEPTED_IMAGE_TYPES,
	MAX_IMAGES,
	SensitiveToggle,
	useStagedImages,
} from './composer-media';
import { getMediaErrorMessage } from './composer-media/error-copy';
import type { ComposerImage } from './composer-media/types';
import type { MastodonCreatePostParams } from '@automattic/api-core';
import type { ActiveMode, ComposerMediaSlot } from 'calypso/reader/social/composer';

interface Ctx {
	mode: ActiveMode | null;
	connectionId: number;
}

export function useMastodonComposerMedia( { connectionId }: Ctx ): ComposerMediaSlot {
	const translate = useTranslate();
	const {
		images,
		addFiles,
		removeImage,
		retryImage,
		setAlt,
		clearAll,
		uploadAllNow,
		hasAny,
		hasUploaded,
		isAllUploaded,
		isAnyPending,
		sensitive,
		setSensitive,
	} = useStagedImages( { max: MAX_IMAGES } );

	const inputRef = useRef< HTMLInputElement | null >( null );
	const atMax = images.length >= MAX_IMAGES;

	const renderGrid = useCallback( () => {
		if ( ! hasAny ) {
			return null;
		}
		return (
			<>
				<MediaGrid< ComposerImage >
					items={ images }
					max={ MAX_IMAGES }
					accept={ ACCEPTED_IMAGE_TYPES }
					onPickFiles={ addFiles }
					onRemove={ removeImage }
					onRetry={ retryImage }
					onSetAlt={ setAlt }
					isPending={ () => false }
					canEditAlt={ ( i ) => i.kind === 'staged' || i.kind === 'failed' }
					isFailed={ ( i ) => i.kind === 'failed' }
					errorMessage={ ( i ) =>
						i.kind === 'failed' ? getMediaErrorMessage( i.reason, translate ) : null
					}
				/>
				<SensitiveToggle sensitive={ sensitive } onChange={ setSensitive } />
			</>
		);
	}, [
		hasAny,
		images,
		addFiles,
		removeImage,
		retryImage,
		setAlt,
		sensitive,
		setSensitive,
		translate,
	] );

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
						e.target.value = '';
					} }
				/>
			</>
		),
		[ atMax, translate, addFiles ]
	);

	const extendBuildParams = useCallback(
		async ( params: unknown ) => {
			if ( ! hasAny ) {
				return params;
			}
			const { media_ids } = await uploadAllNow( connectionId );
			const base = params as MastodonCreatePostParams;
			return {
				...base,
				media_ids,
				sensitive,
			};
		},
		[ hasAny, uploadAllNow, connectionId, sensitive ]
	);

	const onPublishSuccess = useCallback( () => {
		// No-op: Mastodon's POST /statuses returns final CDN URLs, so there's
		// no preview-window cache to patch.
	}, [] );

	const clear = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		( _options: { keepPreviewUrlsAlive: boolean } ) => {
			// Option intentionally unused: atmosphere needs to defer revocation
			// past the AppView lag window; Mastodon's POST /statuses already
			// returns final CDN URLs so we revoke immediately.
			clearAll();
		},
		[ clearAll ]
	);

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
