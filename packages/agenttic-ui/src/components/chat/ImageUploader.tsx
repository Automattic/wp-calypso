import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
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
}

export interface ImageUploaderProps {
	// Data
	images: UploadedImage[];
	uploadingImages?: UploadingImage[];

	// Upload callbacks
	onFilesSelected: ( files: File[] ) => void | Promise< void >;
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
	emptyState?: React.ReactNode;
	className?: string;

	// Optional feature flags
	showFileMetadata?: boolean;
	allowDragToInsert?: boolean;

	// Error handling
	onError?: ( error: string ) => void;

	// Visibility
	visible?: boolean;
}

interface ImagePreviewItemProps {
	image: UploadedImage;
	allowDragToInsert: boolean;
	showFileMetadata: boolean;
	onDragStart: ( image: UploadedImage, e: React.DragEvent ) => void;
	onDragEnd: ( image: UploadedImage, e: React.DragEvent ) => void;
	onRemove: ( e: React.MouseEvent, image: UploadedImage ) => void;
}

const ImagePreviewItem = memo(
	( {
		image,
		allowDragToInsert,
		showFileMetadata,
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
				className={ styles.previewItem }
				draggable={ allowDragToInsert }
				onDragStart={ ( e ) => onDragStart( image, e ) }
				onDragEnd={ ( e ) => onDragEnd( image, e ) }
			>
				<button
					className={ styles.removeButton }
					onClick={ ( e ) => onRemove( e, image ) }
					aria-label={ __( 'Remove image', 'a8c-agenttic' ) }
					type="button"
				>
					×
				</button>
				<img
					src={ image.url }
					alt={ image.alt || fileName }
					className={ styles.previewImage }
					loading="lazy"
				/>
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

export function ImageUploader( {
	images = [],
	uploadingImages = [],
	onFilesSelected,
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
}: ImageUploaderProps ) {
	const [ isDraggingOver, setIsDraggingOver ] = useState( false );
	const [ isDraggingFile, setIsDraggingFile ] = useState( false );
	const [ showInvalidFileMessage, setShowInvalidFileMessage ] =
		useState( false );
	const fileInputRef = useRef< HTMLInputElement >( null );
	const invalidMessageTimeoutRef = useRef< NodeJS.Timeout | null >( null );
	const dragCounterRef = useRef( 0 );

	// Track global drag state to hide preview during drag
	useEffect( () => {
		const handleWindowDragEnter = ( e: DragEvent ) => {
			// Only track file drags, not element drags
			if ( e.dataTransfer?.types?.includes( 'Files' ) ) {
				dragCounterRef.current += 1;
				setIsDraggingFile( true );
			}
		};

		const handleWindowDragLeave = () => {
			dragCounterRef.current -= 1;
			if ( dragCounterRef.current === 0 ) {
				setIsDraggingFile( false );
			}
		};

		const handleWindowDrop = () => {
			dragCounterRef.current = 0;
			setIsDraggingFile( false );
		};

		window.addEventListener( 'dragenter', handleWindowDragEnter );
		window.addEventListener( 'dragleave', handleWindowDragLeave );
		window.addEventListener( 'drop', handleWindowDrop );

		return () => {
			window.removeEventListener( 'dragenter', handleWindowDragEnter );
			window.removeEventListener( 'dragleave', handleWindowDragLeave );
			window.removeEventListener( 'drop', handleWindowDrop );
		};
	}, [] );

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

	const handleDragOver = ( e: React.DragEvent ) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDraggingOver( true );
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

		if ( e.dataTransfer.files ) {
			handleFiles( e.dataTransfer.files );
		}
	};

	const handleFileInputChange = (
		e: React.ChangeEvent< HTMLInputElement >
	) => {
		if ( e.target.files ) {
			handleFiles( e.target.files );
		}
		// Reset the input so the same file can be selected again
		e.target.value = '';
	};

	const openFileDialog = () => {
		fileInputRef.current?.click();
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
			className={ `${ styles.container } ${ className }` }
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
								className={ styles.clickArea }
								onClick={ openFileDialog }
								onDragOver={ handleDragOver }
								onDragLeave={ handleDragLeave }
								onDrop={ handleDrop }
								role="button"
								tabIndex={ 0 }
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
								{ ! hasImages && ! isUploading && (
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
								{ ! isDraggingFile && (
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
											uploadingImages.map( ( { id } ) => (
												<div
													key={ id }
													className={
														styles.previewItem
													}
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
											) ) }
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
}
