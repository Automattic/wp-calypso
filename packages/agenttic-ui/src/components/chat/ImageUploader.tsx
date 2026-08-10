import React, {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { useAgentUIContext } from '../../context/AgentUIContext';
import { cn } from '../../utils/classNames';
import styles from './ImageUploader.module.css';

export interface UploadedImage {
	id: string;
	url: string;
	title?: string;
	name?: string;
	alt?: string;
	mime_type?: string;
}

export interface UploadingImage {
	id: string;
	file?: File;
	// Local preview URL (e.g. a data URL) shown under the uploading indicator
	url?: string;
}

export interface ImageUploaderProps {
	// Data
	images: UploadedImage[];
	uploadingImages?: UploadingImage[];

	// Upload callbacks
	onFilesSelected: ( files: File[] ) => void | Promise< void >;
	onBrowse?: ( files: File[] ) => void | Promise< void >; // Separate callback for browse/click
	onDrop?: ( files: File[] ) => void | Promise< void >; // Separate callback for drag/drop
	onPaste?: ( files: File[] ) => void | Promise< void >; // Separate callback for clipboard paste
	onRemoveImage: ( image: UploadedImage ) => void;

	// Drag callbacks
	onImageDragStart?: ( image: UploadedImage, event: React.DragEvent ) => void;
	onImageDragEnd?: ( image: UploadedImage, event: React.DragEvent ) => void;

	// Validation
	acceptedFileTypes?: string[]; // e.g., ['image/jpeg', 'image/png']
	maxFileSize?: number; // in bytes
	maxFiles?: number;

	// Customization
	uploadingIndicator?: React.ReactNode;
	className?: string;

	// Optional feature flags
	showFileMetadata?: boolean;
	allowDragToInsert?: boolean;

	// Error handling
	onError?: ( error: string ) => void;

	// Visibility
	visible?: boolean;

	// Disables all interactions (browse, drop, paste, remove) while keeping previews visible
	disabled?: boolean;

	// Scopes drag detection to this container and makes it a drop target
	dropZoneRef?: React.RefObject< HTMLElement >;
}

interface ImagePreviewItemProps {
	image: UploadedImage;
	allowDragToInsert: boolean;
	showFileMetadata: boolean;
	disabled: boolean;
	uploading?: boolean;
	uploadingIndicator?: React.ReactNode;
	onDragStart: ( image: UploadedImage, e: React.DragEvent ) => void;
	onDragEnd: ( image: UploadedImage, e: React.DragEvent ) => void;
	onRemove: ( e: React.MouseEvent, image: UploadedImage ) => void;
}

const ImagePreviewItem = memo(
	( {
		image,
		allowDragToInsert,
		showFileMetadata,
		disabled,
		uploading = false,
		uploadingIndicator,
		onDragStart,
		onDragEnd,
		onRemove,
	}: ImagePreviewItemProps ) => {
		const fileType = image.mime_type
			? image.mime_type.split( '/' )[ 1 ].toUpperCase()
			: '';
		const fileName =
			image.title ||
			image.name ||
			image.url.split( '/' ).pop() ||
			'image';

		return (
			<div
				key={ image.id }
				className={ cn( styles.previewItem, {
					[ styles.uploadingItem ]: uploading,
				} ) }
				draggable={ allowDragToInsert && ! disabled && ! uploading }
				onDragStart={ ( e ) => onDragStart( image, e ) }
				onDragEnd={ ( e ) => onDragEnd( image, e ) }
				aria-label={
					uploading
						? __( 'Uploading image', 'a8c-agenttic' )
						: undefined
				}
			>
				<button
					className={ styles.removeButton }
					onClick={ ( e ) => onRemove( e, image ) }
					aria-label={ __( 'Remove image', 'a8c-agenttic' ) }
					type="button"
					disabled={ disabled || uploading }
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill="currentColor"
							fillRule="evenodd"
							clipRule="evenodd"
							d="M7.4632e-09 8C3.34139e-09 3.58172 3.58172 -3.34139e-09 8 -7.4632e-09C12.4183 -1.1585e-08 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 1.1585e-08 12.4183 7.4632e-09 8ZM6.16569 5.03431C5.85327 4.7219 5.34673 4.7219 5.03431 5.03431C4.7219 5.34673 4.7219 5.85327 5.03431 6.16569L6.86863 8L5.03431 9.83432C4.7219 10.1467 4.7219 10.6533 5.03431 10.9657C5.34673 11.2781 5.85327 11.2781 6.16569 10.9657L8 9.13137L9.83432 10.9657C10.1467 11.2781 10.6533 11.2781 10.9657 10.9657C11.2781 10.6533 11.2781 10.1467 10.9657 9.83432L9.13137 8L10.9657 6.16569C11.2781 5.85327 11.2781 5.34673 10.9657 5.03431C10.6533 4.7219 10.1467 4.7219 9.83432 5.03431L8 6.86863L6.16569 5.03431Z"
						/>
					</svg>
				</button>
				<div className={ styles.thumbnail }>
					<img
						src={ image.url }
						alt={ image.alt || fileName }
						className={ styles.previewImage }
						loading="lazy"
					/>
					{ uploading && (
						<div className={ styles.uploadingOverlay }>
							{ uploadingIndicator || (
								<div className={ styles.spinner } />
							) }
						</div>
					) }
				</div>
				{ showFileMetadata && (
					<div className={ styles.previewMeta }>
						<span
							className={ styles.previewFilename }
							title={
								fileName +
								( image.alt ? ` - ${ image.alt }` : '' )
							}
						>
							{ fileName }
						</span>
						<span className={ styles.previewType }>
							{ fileType }
						</span>
					</div>
				) }
			</div>
		);
	}
);

export interface ImageUploaderHandle {
	openFileDialog: () => void;
}

export const ImageUploader = forwardRef<
	ImageUploaderHandle,
	ImageUploaderProps
>( function ImageUploader(
	{
		images = [],
		uploadingImages = [],
		onFilesSelected,
		onBrowse,
		onDrop,
		onPaste,
		onRemoveImage,
		onImageDragStart,
		onImageDragEnd,
		acceptedFileTypes = [ 'image/jpeg', 'image/png' ],
		maxFileSize,
		maxFiles,
		uploadingIndicator,
		className = '',
		showFileMetadata = true,
		allowDragToInsert = true,
		onError,
		visible = true,
		disabled = false,
		dropZoneRef,
	}: ImageUploaderProps,
	ref: React.Ref< ImageUploaderHandle >
) {
	const { textareaRef } = useAgentUIContext();
	const [ isDraggingOver, setIsDraggingOver ] = useState( false );
	const [ isDraggingFile, setIsDraggingFile ] = useState( false );
	const [ showInvalidFileMessage, setShowInvalidFileMessage ] =
		useState( false );
	const fileInputRef = useRef< HTMLInputElement >( null );
	const invalidMessageTimeoutRef = useRef< NodeJS.Timeout | null >( null );
	const dragCounterRef = useRef( 0 );

	// Ref mirror so window-level listeners (drag, paste) see the latest value
	const disabledRef = useRef( disabled );
	useEffect( () => {
		disabledRef.current = disabled;
		if ( disabled ) {
			dragCounterRef.current = 0;
			setIsDraggingFile( false );
			setIsDraggingOver( false );
		}
	}, [ disabled ] );

	const openFileDialog = () => {
		if ( disabled ) {
			return;
		}
		fileInputRef.current?.click();
	};

	useImperativeHandle( ref, () => ( { openFileDialog } ) );

	// Track drag state — scoped to dropZoneRef container when provided, otherwise window
	useEffect( () => {
		const listenTarget = dropZoneRef ? dropZoneRef.current : window;
		if ( ! listenTarget ) {
			return;
		}

		const handleDragEnter = ( e: DragEvent ) => {
			// Only track file drags, not element drags
			if ( disabledRef.current ) {
				return;
			}
			if ( e.dataTransfer?.types?.includes( 'Files' ) ) {
				dragCounterRef.current += 1;
				setIsDraggingFile( true );
			}
		};

		const handleDragLeave = ( e: DragEvent ) => {
			if ( disabledRef.current ) {
				return;
			}
			dragCounterRef.current -= 1;
			// Reset if counter reaches 0 OR if leaving the window entirely
			// (relatedTarget is null when drag leaves the document)
			if ( dragCounterRef.current === 0 || e.relatedTarget === null ) {
				dragCounterRef.current = 0;
				setIsDraggingFile( false );
			}
		};

		const handleDrop = () => {
			dragCounterRef.current = 0;
			setIsDraggingFile( false );
		};

		listenTarget.addEventListener(
			'dragenter',
			handleDragEnter as EventListener
		);
		listenTarget.addEventListener(
			'dragleave',
			handleDragLeave as EventListener
		);
		listenTarget.addEventListener( 'drop', handleDrop );

		return () => {
			listenTarget.removeEventListener(
				'dragenter',
				handleDragEnter as EventListener
			);
			listenTarget.removeEventListener(
				'dragleave',
				handleDragLeave as EventListener
			);
			listenTarget.removeEventListener( 'drop', handleDrop );
		};
	}, [ dropZoneRef ] );

	// Cleanup timeout on unmount
	useEffect( () => {
		return () => {
			if ( invalidMessageTimeoutRef.current ) {
				clearTimeout( invalidMessageTimeoutRef.current );
			}
		};
	}, [] );

	const formatMaxFileSize = useCallback( ( limit: number ) => {
		const cappedLimit = Math.min( limit, 10485760 ); // Cap at 10MB
		const mebibytes = Math.floor( cappedLimit / ( 1024 * 1024 ) );

		if ( mebibytes >= 1 ) {
			return `${ mebibytes } MB`;
		}

		const kibibytes = Math.floor( cappedLimit / 1024 );
		return `${ kibibytes } KB`;
	}, [] );

	const handleFiles = useCallback(
		( files: FileList | File[] ) => {
			if ( ! files || files.length === 0 ) {
				return;
			}

			const fileArray = Array.from( files );

			// Filter to only allowed file types
			const validFiles = fileArray.filter( ( file ) =>
				acceptedFileTypes.includes( file.type )
			);

			// Check if any files were rejected
			if ( validFiles.length < fileArray.length ) {
				setShowInvalidFileMessage( true );

				const allowedTypes = acceptedFileTypes
					.map( ( type ) => type.split( '/' )[ 1 ].toUpperCase() )
					.join( ' or ' );

				onError?.(
					sprintf(
						/* translators: %s: allowed file types (e.g., "JPEG or PNG") */
						__(
							'Only %s image files are allowed.',
							'a8c-agenttic'
						),
						allowedTypes
					)
				);

				// Clear any existing timeout
				if ( invalidMessageTimeoutRef.current ) {
					clearTimeout( invalidMessageTimeoutRef.current );
				}

				// Hide message after 3 seconds
				invalidMessageTimeoutRef.current = setTimeout( () => {
					setShowInvalidFileMessage( false );
				}, 3000 );
			}

			// Check max files limit
			if ( maxFiles && validFiles.length > maxFiles ) {
				onError?.(
					sprintf(
						/* translators: %d: maximum number of files allowed */
						__( 'Maximum %d files allowed.', 'a8c-agenttic' ),
						maxFiles
					)
				);
				const limitedFiles = validFiles.slice( 0, maxFiles );
				if ( limitedFiles.length > 0 ) {
					onFilesSelected( limitedFiles );
				}
				return;
			}

			if ( validFiles.length > 0 ) {
				onFilesSelected( validFiles );
			}
		},
		[ onFilesSelected, acceptedFileTypes, maxFiles, onError ]
	);

	// Store handleFiles in a ref so the paste handler always has the latest version
	const handleFilesRef = useRef( handleFiles );
	useEffect( () => {
		handleFilesRef.current = handleFiles;
	}, [ handleFiles ] );

	// When dropZoneRef is provided, make the full container a drop target
	useEffect( () => {
		const container = dropZoneRef?.current;
		if ( ! container ) {
			return;
		}

		const handleContainerDragOver = ( e: DragEvent ) => {
			e.preventDefault(); // Required to allow drop
		};

		const handleContainerDrop = ( e: DragEvent ) => {
			e.preventDefault();
			dragCounterRef.current = 0;
			setIsDraggingFile( false );
			setIsDraggingOver( false );

			if ( e.dataTransfer?.files && ! disabledRef.current ) {
				handleFilesRef.current( e.dataTransfer.files );
				onDrop?.( Array.from( e.dataTransfer.files ) );
			}
		};

		container.addEventListener( 'dragover', handleContainerDragOver );
		container.addEventListener( 'drop', handleContainerDrop );

		return () => {
			container.removeEventListener(
				'dragover',
				handleContainerDragOver
			);
			container.removeEventListener( 'drop', handleContainerDrop );
		};
	}, [ dropZoneRef, onDrop ] );

	// Handle clipboard paste events
	useEffect( () => {
		const handlePaste = ( e: ClipboardEvent ) => {
			if ( disabledRef.current ) {
				return;
			}
			// Check if the input is focused before processing paste
			// Check both activeElement and event target to handle edge cases
			const isTextareaFocused =
				textareaRef.current &&
				document.activeElement === textareaRef.current;
			const isPasteTargetTextarea =
				textareaRef.current &&
				e.target &&
				( e.target === textareaRef.current ||
					textareaRef.current.contains( e.target as Node ) );

			if ( ! isTextareaFocused && ! isPasteTargetTextarea ) {
				return; // Don't handle paste if input is not focused and paste target is not textarea
			}

			// Check if there are files in the clipboard
			const items = e.clipboardData?.items;
			if ( ! items ) {
				return;
			}

			const imageFiles: File[] = [];

			// Extract image files from clipboard items
			for ( let i = 0; i < items.length; i++ ) {
				const item = items[ i ];
				if ( item.type.startsWith( 'image/' ) ) {
					const file = item.getAsFile();
					if ( file ) {
						imageFiles.push( file );
					}
				}
			}

			if ( imageFiles.length > 0 ) {
				e.preventDefault();
				handleFilesRef.current( imageFiles );
				// Call the specific onPaste callback if provided
				onPaste?.( imageFiles );
			}
		};

		window.addEventListener( 'paste', handlePaste );

		return () => {
			window.removeEventListener( 'paste', handlePaste );
		};
	}, [ onPaste, textareaRef ] );

	const handleDragOver = ( e: React.DragEvent ) => {
		e.preventDefault();
		e.stopPropagation();
		if ( ! disabled ) {
			setIsDraggingOver( true );
		}
	};

	const handleDragLeave = ( e: React.DragEvent ) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDraggingOver( false );
	};

	const handleDrop = ( e: React.DragEvent ) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDraggingOver( false );
		dragCounterRef.current = 0;
		setIsDraggingFile( false );

		if ( e.dataTransfer.files && ! disabled ) {
			const fileArray = Array.from( e.dataTransfer.files );
			handleFiles( e.dataTransfer.files );
			// Call the specific onDrop callback if provided
			onDrop?.( fileArray );
		}
	};

	const handleFileInputChange = (
		e: React.ChangeEvent< HTMLInputElement >
	) => {
		if ( e.target.files && ! disabled ) {
			const fileArray = Array.from( e.target.files );
			handleFiles( e.target.files );
			// Call the specific onBrowse callback if provided
			onBrowse?.( fileArray );
		}
		// Reset the input so the same file can be selected again
		e.target.value = '';
	};

	const handleImageDragStart = useCallback(
		( image: UploadedImage, e: React.DragEvent ) => {
			onImageDragStart?.( image, e );
		},
		[ onImageDragStart ]
	);

	const handleImageDragEnd = useCallback(
		( image: UploadedImage, e: React.DragEvent ) => {
			onImageDragEnd?.( image, e );
		},
		[ onImageDragEnd ]
	);

	const handleRemoveImage = useCallback(
		( e: React.MouseEvent, image: UploadedImage ) => {
			e.stopPropagation();
			onRemoveImage( image );
		},
		[ onRemoveImage ]
	);

	if ( ! visible ) {
		return null;
	}

	const hasImages = images.length > 0;
	const isUploading = uploadingImages.length > 0;

	// Only show drop message when actively dragging a file over the window
	const showDropMessage = isDraggingFile;
	const showPreview = ! isDraggingFile && ( hasImages || isUploading );

	// Container is "active" when it has content to display
	const isActive =
		hasImages || isUploading || isDraggingFile || showInvalidFileMessage;

	// Prepare i18n strings with interpolation
	const fileSizeMessage = maxFileSize
		? sprintf(
				/* translators: %s: maximum file size (e.g., "5 MB") */
				__( 'Upload image files up to %s each.', 'a8c-agenttic' ),
				formatMaxFileSize( maxFileSize )
		  )
		: '';

	const invalidFileMessage = sprintf(
		/* translators: %s: allowed file types (e.g., "JPEG or PNG") */
		__( 'Only %s image files are allowed.', 'a8c-agenttic' ),
		acceptedFileTypes
			.map( ( type ) => type.split( '/' )[ 1 ].toUpperCase() )
			.join( ' or ' )
	);

	return (
		<div
			className={ `${ styles.container } ${
				isActive ? styles.active : ''
			} ${ className }` }
			data-slot="image-uploader"
		>
			<div
				className={ `${ styles.uploader } ${
					isUploading ? styles.uploading : ''
				} ${ isDraggingOver ? styles.draggingOver : '' }` }
			>
				<div className={ styles.content }>
					{ ! showInvalidFileMessage && (
						<>
							<input
								ref={ fileInputRef }
								type="file"
								accept={ acceptedFileTypes.join( ',' ) }
								multiple={ ! maxFiles || maxFiles > 1 }
								onChange={ handleFileInputChange }
								className={ styles.hiddenInput }
							/>
							<div
								className={ cn( styles.clickArea, {
									[ styles.clickAreaDisabled ]: disabled,
								} ) }
								onClick={ openFileDialog }
								onDragOver={ handleDragOver }
								onDragLeave={ handleDragLeave }
								onDrop={ handleDrop }
								role="button"
								tabIndex={ disabled ? -1 : 0 }
								aria-disabled={ disabled }
								onKeyDown={ ( e ) => {
									if ( e.key === 'Enter' || e.key === ' ' ) {
										openFileDialog();
									}
								} }
								aria-label={ __(
									'Click to upload images or drag and drop',
									'a8c-agenttic'
								) }
							>
								{ showDropMessage && (
									<div className={ styles.draggingMessage }>
										<p>
											<strong>
												{ __(
													'Drop files here to use',
													'a8c-agenttic'
												) }
											</strong>
											<br />
											{ maxFileSize && fileSizeMessage }
										</p>
									</div>
								) }
								{ showPreview && (
									<div className={ styles.preview }>
										{ hasImages &&
											images.map( ( image ) => (
												<ImagePreviewItem
													key={ image.id }
													image={ image }
													allowDragToInsert={
														allowDragToInsert
													}
													showFileMetadata={
														showFileMetadata
													}
													disabled={ disabled }
													onDragStart={
														handleImageDragStart
													}
													onDragEnd={
														handleImageDragEnd
													}
													onRemove={
														handleRemoveImage
													}
												/>
											) ) }
										{ isUploading &&
											uploadingImages.map(
												( { id, url, file } ) =>
													url ? (
														<ImagePreviewItem
															key={ id }
															image={ {
																id,
																url,
																name:
																	file?.name ||
																	'image',
																mime_type:
																	file?.type,
															} }
															allowDragToInsert={
																allowDragToInsert
															}
															showFileMetadata={
																showFileMetadata
															}
															disabled={
																disabled
															}
															uploading
															uploadingIndicator={
																uploadingIndicator
															}
															onDragStart={
																handleImageDragStart
															}
															onDragEnd={
																handleImageDragEnd
															}
															onRemove={
																handleRemoveImage
															}
														/>
													) : (
														<div
															key={ id }
															className={ cn(
																styles.previewItem,
																styles.uploadingItem
															) }
															aria-label={ __(
																'Uploading image',
																'a8c-agenttic'
															) }
														>
															{ uploadingIndicator || (
																<div
																	className={
																		styles.uploadingIndicator
																	}
																>
																	<div
																		className={
																			styles.spinner
																		}
																	/>
																</div>
															) }
														</div>
													)
											) }
									</div>
								) }
							</div>
						</>
					) }
					{ showInvalidFileMessage && (
						<div className={ styles.invalidMessage }>
							<p>{ invalidFileMessage }</p>
						</div>
					) }
				</div>
			</div>
		</div>
	);
} );
