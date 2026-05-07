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

export type ImagePickerMode = 'menu' | 'grid';

export interface ImagePickerState {
	isOpen: boolean;
	mode: ImagePickerMode;
	images: ImagePickerItem[];
	selectedNumber: number | null;
	purpose: 'block' | 'featured_image';
}

export function createEmptyPickerState(): ImagePickerState {
	return {
		isOpen: false,
		mode: 'grid',
		images: [],
		selectedNumber: null,
		purpose: 'block',
	};
}

interface ImagePickerModalProps {
	state: ImagePickerState;
}

export function ImagePickerModal( { state }: ImagePickerModalProps ) {
	if ( ! state.isOpen ) {
		return null;
	}
	if ( state.mode === 'menu' ) {
		return <ImagePickerMenu purpose={ state.purpose } />;
	}
	if ( state.images.length === 0 ) {
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
					{ __( 'or say "upload" to add your own, or "generate" to create a new one' ) }
				</span>
			</div>
			<div className="dictation-image-picker__grid">
				{ state.images.map( ( img, i ) => {
					const num = i + 1;
					const isSelected = state.selectedNumber === num;
					return (
						<button
							type="button"
							key={ img.id }
							className={ clsx( 'dictation-image-picker__cell', {
								'is-selected': isSelected,
							} ) }
							onClick={ () => handleGridCellClick( num ) }
							aria-label={
								img.alt || img.title ? `${ img.alt || img.title } (${ num })` : `Image ${ num }`
							}
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
						</button>
					);
				} ) }
			</div>
		</div>
	);
}

function handleGridCellClick( number: number ) {
	const notify = window.sendToDictation;
	if ( notify ) {
		void notify(
			`[The user clicked image ${ number } in the picker. Silently call pick_image_tool with ` +
				`action "select" and number ${ number }. Do not speak; just call the tool.]`
		);
	}
}

interface ImagePickerMenuProps {
	purpose: 'block' | 'featured_image';
}

function closeMenuState() {
	const w = window as unknown as { __dictationImagePicker?: ImagePickerState };
	const state = w.__dictationImagePicker;
	if ( state ) {
		state.isOpen = false;
		state.mode = 'grid';
		state.images = [];
		state.selectedNumber = null;
		window.dispatchEvent( new CustomEvent( 'dictation-image-picker-update' ) );
	}
}

const UploadIcon = () => (
	<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<path
			d="M12 4v11m0-11l-4 4m4-4l4 4M5 17v2a2 2 0 002 2h10a2 2 0 002-2v-2"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const MediaLibraryIcon = () => (
	<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<rect x="3.5" y="5.5" width="17" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
		<circle cx="9" cy="10.5" r="1.5" fill="currentColor" />
		<path
			d="M4 17l4.5-4.5 3 3 4-4L20 17"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinejoin="round"
			fill="none"
		/>
	</svg>
);

const GenerateIcon = () => (
	<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<path
			d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z"
			stroke="currentColor"
			strokeWidth="1.4"
			strokeLinejoin="round"
			fill="currentColor"
			fillOpacity="0.15"
		/>
		<path
			d="M18.5 15l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z"
			stroke="currentColor"
			strokeWidth="1.4"
			strokeLinejoin="round"
			fill="currentColor"
			fillOpacity="0.15"
		/>
	</svg>
);

function ImagePickerMenu( { purpose }: ImagePickerMenuProps ) {
	const title = purpose === 'featured_image' ? __( 'Add a featured image' ) : __( 'Add an image' );

	const handleUpload = useCallback( () => {
		closeMenuState();
		window.__dictationUploadPurpose = purpose;
		window.dispatchEvent( new CustomEvent( 'dictation-file-upload' ) );
	}, [ purpose ] );

	const handleSelect = useCallback( () => {
		const notify = window.sendToDictation;
		if ( notify ) {
			const purposeArg = purpose === 'featured_image' ? '"featured_image"' : '"block"';
			void notify(
				'[The user clicked "Select" in the image chooser. Silently call pick_image_tool ' +
					`with action "open" and purpose ${ purposeArg } to show the media library grid. ` +
					'Do not speak; just call the tool.]'
			);
		}
	}, [ purpose ] );

	const handleGenerate = useCallback( () => {
		const notify = window.sendToDictation;
		if ( notify ) {
			void notify(
				'[The user clicked "Generate" in the image chooser. Ask them briefly out loud what ' +
					'they want you to generate (one short sentence, e.g. "Sure — what should I generate?"), ' +
					'then call generate_image_tool with the description they provide.]'
			);
		}
	}, [] );

	return (
		<div
			className="dictation-image-picker dictation-image-picker--menu"
			role="dialog"
			aria-label={ title }
		>
			<div className="dictation-image-picker__header">
				<span className="dictation-image-picker__title">{ title }</span>
				<span className="dictation-image-picker__hint">
					{ __( 'Say one of these out loud, or click to choose' ) }
				</span>
			</div>
			<div className="dictation-image-picker__menu">
				<button
					type="button"
					className="dictation-image-picker__menu-option"
					onClick={ handleUpload }
				>
					<span className="dictation-image-picker__menu-icon" aria-hidden="true">
						<UploadIcon />
					</span>
					<span className="dictation-image-picker__menu-label">{ __( 'Upload' ) }</span>
					<span className="dictation-image-picker__menu-sub">{ __( 'from your computer' ) }</span>
				</button>
				<button
					type="button"
					className="dictation-image-picker__menu-option"
					onClick={ handleSelect }
				>
					<span className="dictation-image-picker__menu-icon" aria-hidden="true">
						<MediaLibraryIcon />
					</span>
					<span className="dictation-image-picker__menu-label">{ __( 'Select' ) }</span>
					<span className="dictation-image-picker__menu-sub">
						{ __( 'from your media library' ) }
					</span>
				</button>
				<button
					type="button"
					className="dictation-image-picker__menu-option"
					onClick={ handleGenerate }
				>
					<span className="dictation-image-picker__menu-icon" aria-hidden="true">
						<GenerateIcon />
					</span>
					<span className="dictation-image-picker__menu-label">{ __( 'Generate' ) }</span>
					<span className="dictation-image-picker__menu-sub">{ __( 'with AI' ) }</span>
				</button>
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
