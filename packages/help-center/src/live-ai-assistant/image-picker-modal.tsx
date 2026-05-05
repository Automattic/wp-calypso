import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useCallback, useEffect, useRef } from 'react';

export interface ImagePickerItem {
	id: number;
	url: string;
	thumbnail: string;
	title: string;
	alt: string;
	width: number;
	height: number;
}

export interface ImagePickerState {
	isOpen: boolean;
	images: ImagePickerItem[];
	selectedNumber: number | null;
	purpose: 'block' | 'featured_image';
}

export function createEmptyPickerState(): ImagePickerState {
	return { isOpen: false, images: [], selectedNumber: null, purpose: 'block' };
}

interface ImagePickerModalProps {
	state: ImagePickerState;
}

export function ImagePickerModal( { state }: ImagePickerModalProps ) {
	if ( ! state.isOpen || state.images.length === 0 ) {
		return null;
	}

	return (
		<div className="dictation-image-picker" role="dialog" aria-label={ __( 'Pick an image' ) }>
			<div className="dictation-image-picker__header">
				<span className="dictation-image-picker__title">
					{ state.purpose === 'featured_image'
						? __( 'Pick a featured image — say a number' )
						: __( 'Pick an image — say a number' ) }
				</span>
				<span className="dictation-image-picker__hint">
					{ __( 'or say "upload" to add a new image' ) }
				</span>
			</div>
			<div className="dictation-image-picker__grid">
				{ state.images.map( ( img, i ) => {
					const num = i + 1;
					const isSelected = state.selectedNumber === num;
					return (
						<div
							key={ img.id }
							className={ clsx( 'dictation-image-picker__cell', {
								'is-selected': isSelected,
							} ) }
						>
							<img
								src={ img.thumbnail }
								alt={ img.alt || img.title }
								className="dictation-image-picker__thumb"
								draggable={ false }
							/>
							<span
								className={ clsx( 'dictation-image-picker__number', {
									'is-selected': isSelected,
								} ) }
							>
								{ num }
							</span>
						</div>
					);
				} ) }
			</div>
		</div>
	);
}

interface UploadedMedia {
	id: number;
	source_url: string;
	title?: { rendered?: string };
	alt_text?: string;
}

async function uploadFileToMediaLibrary( file: File ): Promise< UploadedMedia > {
	const wp = (
		window as unknown as { wp?: { apiFetch?: ( opts: unknown ) => Promise< unknown > } }
	 ).wp;
	if ( ! wp?.apiFetch ) {
		throw new Error( 'wp.apiFetch is not available' );
	}

	const formData = new FormData();
	formData.append( 'file', file );
	formData.append( 'title', file.name.replace( /\.[^.]+$/, '' ) );

	return ( await wp.apiFetch( {
		path: '/wp/v2/media',
		method: 'POST',
		body: formData,
	} ) ) as UploadedMedia;
}

/**
 * Hidden file input that lets the pick-image tool trigger an OS file dialog.
 * After the user selects a file it is uploaded to the WP media library and
 * automatically inserted (or set as featured image). The AI is notified via
 * `sendToDictation` so it can acknowledge without duplicating the action.
 */
export function DictationFileUpload() {
	const inputRef = useRef< HTMLInputElement | null >( null );

	const handleChange = useCallback( async ( e: React.ChangeEvent< HTMLInputElement > ) => {
		const file = e.target.files?.[ 0 ];
		// Reset so the same file can be re-selected.
		e.target.value = '';

		if ( ! file ) {
			return;
		}

		const purpose = window.__dictationUploadPurpose || 'block';
		const notify = window.sendToDictation;

		try {
			const media = await uploadFileToMediaLibrary( file );
			const img: ImagePickerItem = {
				id: media.id,
				url: media.source_url,
				thumbnail: media.source_url,
				title: media.title?.rendered ?? file.name,
				alt: media.alt_text ?? '',
				width: 0,
				height: 0,
			};

			// Reuse the same block-insertion / featured-image helpers via dispatch.
			const { dispatch } = await import( '@wordpress/data' );
			if ( purpose === 'featured_image' ) {
				const d = dispatch( 'core/editor' ) as unknown as {
					editPost: ( edits: Record< string, unknown > ) => void | Promise< unknown >;
				};
				if ( d?.editPost ) {
					await d.editPost( { featured_media: img.id } );
				}
			} else {
				const wp = ( window as unknown as { wp?: { blocks?: { createBlock?: unknown } } } ).wp;
				const createBlock = wp?.blocks?.createBlock as
					| ( ( name: string, attrs?: Record< string, unknown > ) => unknown )
					| undefined;
				const d = dispatch( 'core/block-editor' ) as unknown as {
					insertBlock: ( block: unknown ) => void | Promise< unknown >;
				};
				if ( createBlock && d?.insertBlock ) {
					const block = createBlock( 'core/image', {
						id: img.id,
						url: img.url,
						alt: img.alt,
						caption: '',
					} );
					await d.insertBlock( block );
				}
			}

			if ( notify ) {
				const label =
					purpose === 'featured_image' ? 'set as the featured image' : 'inserted as an image block';
				void notify(
					`[The user uploaded "${ img.title }" and it was automatically ${ label }. ` +
						'Acknowledge briefly. Do NOT call insert_block_tool — it is already done.]'
				);
			}
		} catch ( err ) {
			if ( notify ) {
				const msg = err instanceof Error ? err.message : 'unknown error';
				void notify( `[Image upload failed: ${ msg }. Let the user know something went wrong.]` );
			}
		}
	}, [] );

	useEffect( () => {
		const onUploadRequest = () => {
			inputRef.current?.click();
		};
		window.addEventListener( 'dictation-file-upload', onUploadRequest );
		return () => window.removeEventListener( 'dictation-file-upload', onUploadRequest );
	}, [] );

	return (
		<input
			ref={ inputRef }
			type="file"
			accept="image/*"
			style={ { display: 'none' } }
			onChange={ handleChange }
		/>
	);
}
