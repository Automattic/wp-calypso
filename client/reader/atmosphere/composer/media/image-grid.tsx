import { Button, Spinner } from '@wordpress/components';
import { Icon, closeSmall, image as imageIcon } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useRef } from 'react';
import { AltTextPopover } from './alt-text-popover';
import type { ComposerImage } from './types';
import type { AtmosphereError } from '@automattic/api-core';

interface Props {
	images: ComposerImage[];
	max: number;
	onPickFiles: ( files: File[] ) => void;
	onRemove: ( localId: string ) => void;
	onRetry: ( localId: string ) => void;
	onSetAlt: ( localId: string, alt: string ) => void;
}

export function ImageGrid( { images, max, onPickFiles, onRemove, onRetry, onSetAlt }: Props ) {
	const translate = useTranslate();
	const inputRef = useRef< HTMLInputElement >( null );

	if ( images.length === 0 ) {
		return null;
	}

	return (
		<div
			className="atmosphere-composer__image-grid"
			role="group"
			aria-label={ translate( 'Attached images' ) as string }
		>
			{ images.map( ( image ) => (
				<Thumbnail
					key={ image.localId }
					image={ image }
					onRemove={ onRemove }
					onRetry={ onRetry }
					onSetAlt={ onSetAlt }
				/>
			) ) }
			{ images.length < max && (
				<>
					<button
						type="button"
						className="atmosphere-composer__image-add"
						aria-label={ translate( 'Add more images' ) as string }
						onClick={ () => inputRef.current?.click() }
					>
						<Icon icon={ imageIcon } size={ 24 } />
					</button>
					<input
						ref={ inputRef }
						type="file"
						accept="image/jpeg,image/png,image/webp"
						multiple
						hidden
						onChange={ ( e ) => {
							const files = Array.from( e.target.files ?? [] );
							if ( files.length > 0 ) {
								onPickFiles( files );
							}
							// Reset so picking the same file again still triggers onChange.
							e.target.value = '';
						} }
					/>
				</>
			) }
		</div>
	);
}

function Thumbnail( {
	image,
	onRemove,
	onRetry,
	onSetAlt,
}: {
	image: ComposerImage;
	onRemove: ( id: string ) => void;
	onRetry: ( id: string ) => void;
	onSetAlt: ( id: string, alt: string ) => void;
} ) {
	const translate = useTranslate();
	const isFailed = image.kind === 'failed';
	const isPending = image.kind === 'compressing' || image.kind === 'uploading';

	const previewUrl = 'previewUrl' in image ? image.previewUrl : '';
	const alt = 'alt' in image ? image.alt : '';

	return (
		<div className={ clsx( 'atmosphere-composer__image', { 'is-failed': isFailed } ) }>
			{ previewUrl && (
				// `alt` may be empty until the user fills it in via the popover.
				// Force `role="img"` so screen readers and tests can still locate
				// the attached image; when `alt` is non-empty the role is
				// already implicit.
				// eslint-disable-next-line jsx-a11y/no-redundant-roles
				<img src={ previewUrl } alt={ alt } role="img" />
			) }
			{ isPending && <Spinner /> }
			<button
				type="button"
				className="atmosphere-composer__image-remove"
				aria-label={ translate( 'Remove image' ) as string }
				onClick={ () => onRemove( image.localId ) }
			>
				<Icon icon={ closeSmall } size={ 16 } />
			</button>
			{ ( image.kind === 'uploading' || image.kind === 'uploaded' ) && (
				<div className="atmosphere-composer__image-alt">
					<AltTextPopover
						currentAlt={ alt }
						previewUrl={ previewUrl }
						onSave={ ( next ) => onSetAlt( image.localId, next ) }
					/>
				</div>
			) }
			{ isFailed && (
				<div className="atmosphere-composer__image-error">
					<span>{ errorMessage( image.error, translate ) }</span>
					<Button variant="link" onClick={ () => onRetry( image.localId ) }>
						{ translate( 'Retry' ) }
					</Button>
				</div>
			) }
		</div>
	);
}

function errorMessage( err: AtmosphereError, t: ReturnType< typeof useTranslate > ): string {
	switch ( err.kind ) {
		case 'blob_too_large':
			return t( 'Image is too large.' ) as string;
		case 'blob_unsupported_type':
			return t( 'We can only post JPG, PNG, or WebP images.' ) as string;
		case 'blob_decode_failed':
			return t( 'We couldn’t read this image. Try a different file.' ) as string;
		case 'rate_limited':
			return t( 'You’re posting too quickly. Try again in a moment.' ) as string;
		case 'upstream_unavailable':
			return t( 'Bluesky is taking longer than usual. Please try again.' ) as string;
		default:
			return t( 'Something went wrong. Please try again.' ) as string;
	}
}
