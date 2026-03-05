import {
	Button,
	FormFileUpload,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Icon, upload } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import {
	A4A_LOGO_MAX_FILE_SIZE_BYTES,
	A4A_LOGO_REQUIRED_HEIGHT,
	A4A_LOGO_REQUIRED_WIDTH,
	getAcceptMimeTypes,
	REFERRAL_CHECKOUT_LOGO_ALLOWED_MIME_TYPES,
	type LogoFileValidationError,
	validateLogoDimensions,
	validateLogoFile,
} from 'calypso/a8c-for-agencies/lib/logo-file-validation';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export interface LogoFileUploadProps {
	/** Current preview URL (e.g. object URL of selected file). */
	displayUrl?: string | null;
	/** Called when user selects a valid file. */
	onFileSelect: ( file: File ) => void;
}

/**
 * Reusable logo file upload using FormFileUpload.
 * Validates format (JPG, PNG), dimensions (800x320), and size (max 10 MB) on the client.
 */
function LogoFileUpload( { displayUrl, onFileSelect }: LogoFileUploadProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ error, setError ] = useState< LogoFileValidationError | 'dimensions' | null >( null );
	const maxLogoSizeMb = Math.floor( A4A_LOGO_MAX_FILE_SIZE_BYTES / ( 1024 * 1024 ) );

	const handleFileSelect = useCallback(
		async ( event: React.ChangeEvent< HTMLInputElement > ) => {
			const file = event.target.files?.[ 0 ];
			event.target.value = '';
			setError( null );
			if ( ! file ) {
				return;
			}
			const validationError = validateLogoFile( file, {
				allowedMimeTypes: REFERRAL_CHECKOUT_LOGO_ALLOWED_MIME_TYPES,
				maxFileSizeBytes: A4A_LOGO_MAX_FILE_SIZE_BYTES,
			} );
			if ( validationError ) {
				setError( validationError );
				return;
			}

			const isValidDimensions = await validateLogoDimensions( file, {
				requiredWidth: A4A_LOGO_REQUIRED_WIDTH,
				requiredHeight: A4A_LOGO_REQUIRED_HEIGHT,
			} );

			if ( ! isValidDimensions ) {
				setError( 'dimensions' );
				return;
			}

			dispatch( recordTracksEvent( 'calypso_a4a_client_referral_logo_file_select' ) );
			onFileSelect( file );
		},
		[ dispatch, onFileSelect ]
	);

	let errorMessage: React.ReactNode | null = null;

	if ( error === 'format' ) {
		errorMessage = translate( 'Unsupported format. Please use JPG or PNG.' );
	}

	if ( error === 'size' ) {
		errorMessage = translate( 'File is too large. Please upload a logo under %(maxSize)d MB.', {
			args: { maxSize: maxLogoSizeMb },
		} );
	}

	if ( error === 'dimensions' ) {
		errorMessage = translate( 'Company logo must have %(width)dpx width and %(height)dpx height.', {
			args: {
				width: A4A_LOGO_REQUIRED_WIDTH,
				height: A4A_LOGO_REQUIRED_HEIGHT,
			},
		} );
	}

	const uploadHelpText = translate(
		'Upload your logo sized at %(width)dpx by %(height)dpx. JPG or PNG. Max %(maxSize)d MB.',
		{
			args: {
				width: A4A_LOGO_REQUIRED_WIDTH,
				height: A4A_LOGO_REQUIRED_HEIGHT,
				maxSize: maxLogoSizeMb,
			},
		}
	);

	return (
		<FormFileUpload
			accept={ getAcceptMimeTypes( REFERRAL_CHECKOUT_LOGO_ALLOWED_MIME_TYPES ) }
			onChange={ handleFileSelect }
			render={ ( { openFileDialog } ) => (
				<VStack className="logo-file-upload" spacing={ 0 }>
					<HStack spacing={ 5 } alignment="top">
						<Button
							variant="tertiary"
							className={ clsx(
								'logo-file-upload-placeholder',
								displayUrl && 'logo-file-upload-placeholder--has-image'
							) }
							onClick={ openFileDialog }
							aria-label={ displayUrl ? translate( 'Replace logo' ) : translate( 'Select logo' ) }
						>
							{ displayUrl ? (
								<img
									src={ displayUrl }
									alt={ translate( 'Logo preview' ) }
									className="logo-file-upload-preview"
								/>
							) : (
								<Icon icon={ upload } className="logo-file-upload-icon" />
							) }
						</Button>
						<VStack spacing={ 5 } style={ { flex: 1, minWidth: 0 } }>
							<VStack spacing={ 2 }>
								<Button
									variant="secondary"
									onClick={ openFileDialog }
									style={ { width: 'fit-content' } }
								>
									{ displayUrl ? translate( 'Replace file' ) : translate( 'Select file' ) }
								</Button>
								{ errorMessage && (
									<Text as="p" className="logo-file-upload-error" role="alert" size={ 12 }>
										{ errorMessage }
									</Text>
								) }
							</VStack>
							<VStack spacing={ 0 }>
								<Text as="p" variant="muted" size={ 12 }>
									{ uploadHelpText }
								</Text>
							</VStack>
						</VStack>
					</HStack>
				</VStack>
			) }
		/>
	);
}

export default LogoFileUpload;
