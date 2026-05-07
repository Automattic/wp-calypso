import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

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

async function insertUploadedImageBlock( img: ImagePickerItem ) {
	const wpBlocks = ( window as unknown as { wp?: { blocks?: { createBlock?: unknown } } } ).wp;
	const createBlock = wpBlocks?.blocks?.createBlock as
		| ( ( name: string, attrs?: Record< string, unknown > ) => unknown )
		| undefined;
	const d = dispatch( 'core/block-editor' ) as unknown as {
		insertBlock: ( block: unknown ) => void | Promise< unknown >;
	};
	if ( ! createBlock || ! d?.insertBlock ) {
		throw new Error( 'Block editor not available' );
	}
	const block = createBlock( 'core/image', {
		id: img.id,
		url: img.url,
		alt: img.alt,
		caption: '',
	} );
	const out = d.insertBlock( block );
	if ( out && typeof ( out as Promise< unknown > ).then === 'function' ) {
		await out;
	}
}

async function setUploadedFeaturedMedia( mediaId: number ) {
	const d = dispatch( 'core/editor' ) as unknown as {
		editPost: ( edits: Record< string, unknown > ) => void | Promise< unknown >;
	};
	if ( ! d?.editPost ) {
		throw new Error( 'Post editor not available' );
	}
	const out = d.editPost( { featured_media: mediaId } );
	if ( out && typeof ( out as Promise< unknown > ).then === 'function' ) {
		await out;
	}
}

/**
 * Upload UI for dictation: browsers block programmatic `.click()` on file inputs when there is
 * no recent user gesture, and ignore clicks on inputs with `display: none`. We show a short-lived
 * overlay with a label-linked control so opening the OS picker uses a real tap/click.
 */
export function DictationFileUpload() {
	const inputRef = useRef< HTMLInputElement | null >( null );
	const cancelNotifiedRef = useRef( false );
	const uploadInputId = useId();
	const titleId = `${ uploadInputId }-title`;
	const [ promptOpen, setPromptOpen ] = useState( false );

	useEffect( () => {
		if ( promptOpen ) {
			cancelNotifiedRef.current = false;
		}
	}, [ promptOpen ] );

	const notifyCancelled = useCallback( () => {
		if ( cancelNotifiedRef.current ) {
			return;
		}
		cancelNotifiedRef.current = true;
		const notify = window.sendToDictation;
		if ( notify ) {
			void notify(
				'[Upload cancelled — no file was chosen. Acknowledge briefly and offer to try again.]'
			);
		}
	}, [] );

	const handleCancel = useCallback( () => {
		setPromptOpen( false );
		if ( inputRef.current ) {
			inputRef.current.value = '';
		}
		notifyCancelled();
	}, [ notifyCancelled ] );

	useEffect( () => {
		if ( ! promptOpen ) {
			return;
		}
		const onKey = ( e: KeyboardEvent ) => {
			if ( e.key === 'Escape' ) {
				handleCancel();
			}
		};
		window.addEventListener( 'keydown', onKey );
		return () => window.removeEventListener( 'keydown', onKey );
	}, [ promptOpen, handleCancel ] );

	useEffect( () => {
		const onUploadRequest = () => {
			if ( inputRef.current ) {
				inputRef.current.value = '';
			}
			setPromptOpen( true );
		};
		window.addEventListener( 'dictation-file-upload', onUploadRequest );
		return () => window.removeEventListener( 'dictation-file-upload', onUploadRequest );
	}, [] );

	const handleChange = useCallback( async ( e: React.ChangeEvent< HTMLInputElement > ) => {
		const file = e.target.files?.[ 0 ];
		e.target.value = '';

		if ( ! file ) {
			return;
		}

		setPromptOpen( false );

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

			if ( purpose === 'featured_image' ) {
				await setUploadedFeaturedMedia( img.id );
			} else {
				await insertUploadedImageBlock( img );
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

	return (
		<>
			<input
				ref={ inputRef }
				id={ uploadInputId }
				type="file"
				accept="image/*"
				className="dictation-file-upload__input"
				onChange={ handleChange }
				tabIndex={ -1 }
			/>
			{ promptOpen && (
				<div className="dictation-file-upload">
					<button
						type="button"
						className="dictation-file-upload__backdrop"
						aria-label={ __( 'Cancel upload' ) }
						onClick={ handleCancel }
					/>
					<div
						role="dialog"
						aria-modal="true"
						aria-labelledby={ titleId }
						className="dictation-file-upload__dialog"
					>
						<h2 id={ titleId } className="dictation-file-upload__title">
							{ __( 'Upload an image' ) }
						</h2>
						<p className="dictation-file-upload__body">
							{ __(
								'Browsers require you to tap the button below once to open your files. Then choose an image — it will upload and be added automatically.'
							) }
						</p>
						<div className="dictation-file-upload__actions">
							<label htmlFor={ uploadInputId } className="dictation-file-upload__choose">
								{ __( 'Choose image file' ) }
							</label>
							<button
								type="button"
								className="dictation-file-upload__cancel"
								onClick={ handleCancel }
							>
								{ __( 'Cancel' ) }
							</button>
						</div>
					</div>
				</div>
			) }
		</>
	);
}
