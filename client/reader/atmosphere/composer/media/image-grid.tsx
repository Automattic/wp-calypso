import { Button, Spinner } from '@wordpress/components';
import { Icon, closeSmall, image as imageIcon } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useRef } from 'react';
import { AltTextPopover } from './alt-text-popover';
import { ACCEPTED_IMAGE_TYPES } from './constants';
import { getMediaErrorMessage } from './error-copy';
import type { ComposerImage } from './types';

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
						accept={ ACCEPTED_IMAGE_TYPES }
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
	const imgAlt = alt.length > 0 ? alt : ( translate( 'Attached image' ) as string );

	return (
		<div className={ clsx( 'atmosphere-composer__image', { 'is-failed': isFailed } ) }>
			{ previewUrl && <img src={ previewUrl } alt={ imgAlt } /> }
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
					<span>{ getMediaErrorMessage( image.error, translate ) }</span>
					<Button variant="link" onClick={ () => onRetry( image.localId ) }>
						{ translate( 'Retry' ) }
					</Button>
				</div>
			) }
		</div>
	);
}
