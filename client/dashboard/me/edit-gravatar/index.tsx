import path from 'path';
import {
	Button,
	Spinner,
	FormFileUpload,
	DropZone,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, upload, caution } from '@wordpress/icons';
import { useState, CSSProperties, KeyboardEvent } from 'react';
import wpcom from 'calypso/lib/wp';

const ALLOWED_FILE_EXTENSIONS = [ 'jpg', 'jpeg', 'gif', 'png' ];

/**
 * Crops an image file to a square aspect ratio
 * @param file - The image file to crop
 * @returns A promise that resolves to the cropped file blob
 */
const cropFile = async ( file: File ): Promise< Blob > => {
	return new Promise( ( resolve, reject ) => {
		const img = new Image();
		img.onload = () => {
			// Get the smallest dimension to make a square
			const size = Math.min( img.width, img.height );

			// Calculate crop coordinates (center the crop)
			const left = ( img.width - size ) / 2;
			const top = ( img.height - size ) / 2;

			// Create canvas for cropping
			const canvas = document.createElement( 'canvas' );
			canvas.width = size;
			canvas.height = size;

			// Draw cropped image on canvas
			const ctx = canvas.getContext( '2d' );
			if ( ! ctx ) {
				reject( new Error( 'Could not get canvas context' ) );
				return;
			}

			ctx.drawImage( img, left, top, size, size, 0, 0, size, size );

			// Convert canvas to blob
			canvas.toBlob( ( blob ) => {
				if ( ! blob ) {
					reject( new Error( 'Could not create blob from canvas' ) );
					return;
				}
				resolve( blob );
			}, file.type );
		};

		img.onerror = () => {
			reject( new Error( 'Could not load image for cropping' ) );
		};

		// Load image from file
		img.src = URL.createObjectURL( file );
	} );
};

interface EditGravatarProps {
	/** URL to the user's avatar image */
	avatarUrl: string;
	/** User's email address for gravatar upload */
	userEmail: string;
	/** Whether the user's email is verified */
	isEmailVerified?: boolean;
}

const EditGravatar = ( { isEmailVerified = true, avatarUrl, userEmail }: EditGravatarProps ) => {
	const [ isUploading, setIsUploading ] = useState< boolean >( false );
	const [ tempImage, setTempImage ] = useState< string | null >( null );
	const [ showEmailVerificationNotice, setShowEmailVerificationNotice ] =
		useState< boolean >( false );
	const [ isOverlayVisible, setIsOverlayVisible ] = useState< boolean >( false );

	const uploadButtonLabel = isEmailVerified
		? __( 'Change profile photo' )
		: __( 'Verify your email to change profile photo' );

	const handleUploadError = ( errorMessage: string ): void => {
		// This could be replaced with a WordPress Notice component in the future
		// eslint-disable-next-line no-console
		console.error( errorMessage );
	};

	const uploadGravatarFile = async ( file: File ): Promise< void > => {
		setIsUploading( true );
		// crop file image to be a square
		const croppedFile = await cropFile( file );
		// Upload using wpcom REST API
		wpcom.req
			.post( {
				method: 'POST',
				path: '/gravatar-upload',
				body: {},
				apiNamespace: 'wpcom/v2',
				formData: [
					[ 'account', userEmail ],
					[ 'filedata', croppedFile ],
				],
			} )
			.then( () => {
				setIsUploading( false );

				// Create a temporary image preview
				const fileReader = new FileReader();
				fileReader.addEventListener( 'load', () => {
					if ( typeof fileReader.result === 'string' ) {
						setTempImage( fileReader.result );
					}
				} );
				fileReader.readAsDataURL( file );
			} )
			.catch( () => {
				setIsUploading( false );
				handleUploadError(
					__( 'Hmm, your new profile photo was not saved. Please try uploading again.' )
				);
			} );
	};

	const handleReceiveFile = ( event: React.ChangeEvent< HTMLInputElement > ): void => {
		const files = event.target.files;
		if ( ! files || ! files.length ) {
			return;
		}

		const file = files[ 0 ];
		const extension = path.extname( file.name ).toLowerCase().substring( 1 );

		if ( ALLOWED_FILE_EXTENSIONS.indexOf( extension ) === -1 ) {
			let errorMessage = '';

			if ( extension ) {
				// translators: %s is the file extension that is not supported
				errorMessage = __(
					'Sorry, %s files are not supported - please make sure your image is in JPG, GIF, or PNG format.'
				).replace( '%s', extension );
			} else {
				errorMessage = __(
					'Sorry, images of that filetype are not supported - please make sure your image is in JPG, GIF, or PNG format.'
				);
			}

			handleUploadError( errorMessage );
			return;
		}

		uploadGravatarFile( file );
	};

	const handleUnverifiedUserClick = (): void => {
		if ( ! isEmailVerified ) {
			setShowEmailVerificationNotice( true );
		}
	};

	const closeVerifyEmailDialog = (): void => {
		setShowEmailVerificationNotice( false );
	};

	const handleMouseOver = (): void => {
		setIsOverlayVisible( true );
	};

	const handleMouseOut = (): void => {
		setIsOverlayVisible( false );
	};

	const handleFocus = (): void => {
		setIsOverlayVisible( true );
	};

	const handleBlur = (): void => {
		setIsOverlayVisible( false );
	};

	const handleKeyDown = ( event: KeyboardEvent< HTMLDivElement > ): void => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
			if ( isEmailVerified ) {
				// The openFileDialog function will be called by the button's onClick handler
			}
		}
	};

	// Create styles with hover effect
	const overlayStyle: CSSProperties = {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		opacity: isOverlayVisible ? 1 : 0,
		transition: 'opacity 0.2s',
	};

	return (
		<VStack
			style={ {
				opacity: isUploading ? 0.7 : 1,
			} }
			spacing={ 4 }
		>
			<FormFileUpload
				accept="image/*"
				onChange={ handleReceiveFile }
				render={ ( { openFileDialog } ) => (
					<button
						type="button"
						onClick={ () => {
							handleUnverifiedUserClick();
							if ( isEmailVerified ) {
								openFileDialog();
							}
						} }
						style={ {
							border: 'none',
							padding: 0,
							background: 'transparent',
							cursor: isEmailVerified ? 'pointer' : 'default',
						} }
						aria-label={ uploadButtonLabel }
					>
						<div
							style={ {
								position: 'relative',
								width: 150,
								height: 150,
								borderRadius: '50%',
								overflow: 'hidden',
							} }
							onMouseOver={ handleMouseOver }
							onMouseOut={ handleMouseOut }
							onFocus={ handleFocus }
							onBlur={ handleBlur }
							onKeyDown={ handleKeyDown }
							tabIndex={ 0 }
							role="button"
							aria-label={ uploadButtonLabel }
						>
							{ isEmailVerified && (
								<DropZone
									label={ __( 'Drop to upload profile photo' ) }
									onFilesDrop={ ( files: File[] ) => {
										if ( files.length ) {
											uploadGravatarFile( files[ 0 ] );
										}
									} }
									style={ {
										position: 'absolute',
										top: 0,
										left: 0,
										width: '100%',
										height: '100%',
										zIndex: 1,
									} }
								/>
							) }

							<img
								src={ tempImage || avatarUrl }
								alt={ __( 'Gravatar' ) }
								width={ 150 }
								height={ 150 }
								style={ { objectFit: 'cover' } }
							/>

							<div className="overlay-hover" style={ overlayStyle }>
								<div style={ { color: '#fff' } }>
									{ ! isEmailVerified && (
										<Icon icon={ caution } size={ 24 } style={ { fill: '#fff' } } />
									) }

									{ isEmailVerified && ! isUploading && (
										<Icon icon={ upload } size={ 24 } style={ { fill: '#fff' } } />
									) }

									{ isEmailVerified && isUploading && <Spinner /> }
								</div>
							</div>
						</div>
					</button>
				) }
			/>

			{ showEmailVerificationNotice && (
				<div
					style={ {
						backgroundColor: '#fff8e5',
						padding: 12,
						margin: '8px 0',
						borderLeft: '3px solid #f0b849',
					} }
				>
					<p style={ { marginBottom: 8 } }>
						{ __( 'Please verify your email address to change your profile photo.' ) }
					</p>
					<Button onClick={ closeVerifyEmailDialog } variant="secondary">
						{ __( 'Close' ) }
					</Button>
				</div>
			) }
		</VStack>
	);
};

export default EditGravatar;
