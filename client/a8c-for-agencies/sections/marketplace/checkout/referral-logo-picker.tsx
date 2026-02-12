import { Button, FormFileUpload } from '@wordpress/components';
import { Icon, upload } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';

interface ReferralLogoPickerProps {
	onLogoChange: ( logoUrl: string | null, logoFile: File | null ) => void;
	selectedLogoUrl: string | null;
	selectedLogoFile: File | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [ 'image/png', 'image/svg+xml' ];

function ReferralLogoPicker( {
	onLogoChange,
	selectedLogoUrl,
	selectedLogoFile,
}: ReferralLogoPickerProps ) {
	const translate = useTranslate();
	const agency = useSelector( getActiveAgency );
	const fileInputRef = useRef< HTMLInputElement >( null );

	const profileLogoUrl = agency?.profile?.company_details?.logo_url || '';
	const [ validationError, setValidationError ] = useState< string | null >( null );
	const [ previewUrl, setPreviewUrl ] = useState< string | null >( null );

	const displayUrl = previewUrl || selectedLogoUrl || profileLogoUrl;
	const hasCustomLogo = !! ( previewUrl || selectedLogoUrl );

	const validateFile = useCallback(
		( file: File ): string | null => {
			if ( ! ALLOWED_FILE_TYPES.includes( file.type ) ) {
				return translate( 'Invalid file format. Please upload a PNG or SVG file.' );
			}

			if ( file.size > MAX_FILE_SIZE ) {
				return translate( 'File size exceeds 5MB. Please upload a smaller file.' );
			}

			return null;
		},
		[ translate ]
	);

	const handleFileSelect = useCallback(
		( event: React.ChangeEvent< HTMLInputElement > ) => {
			const file = event.target.files?.[ 0 ];
			if ( ! file ) {
				return;
			}

			const error = validateFile( file );
			if ( error ) {
				setValidationError( error );
				return;
			}

			setValidationError( null );

			// Create preview URL
			const objectUrl = URL.createObjectURL( file );
			setPreviewUrl( objectUrl );

			// Notify parent component
			onLogoChange( objectUrl, file );

			// Clear input so same file can be selected again
			event.target.value = '';
		},
		[ validateFile, onLogoChange ]
	);

	const handleRevert = useCallback( () => {
		setPreviewUrl( null );
		setValidationError( null );
		onLogoChange( profileLogoUrl || null, null );
	}, [ onLogoChange, profileLogoUrl ] );

	const handlePlaceholderClick = useCallback( () => {
		fileInputRef.current?.click();
	}, [] );

	return (
		<div className="logo-upload-section">
			<h3>{ translate( 'Your logo' ) }</h3>
			<p className="logo-upload-description">
				{ translate( 'Builds trust and shows this referral comes from you.' ) }
			</p>

			<div className="logo-upload-row">
				<button
					type="button"
					className="logo-placeholder"
					onClick={ handlePlaceholderClick }
					aria-label={ translate( 'Upload logo' ) }
				>
					{ displayUrl ? (
						<img src={ displayUrl } alt={ translate( 'Logo preview' ) } />
					) : (
						<Icon icon={ upload } />
					) }
				</button>

				<div className="logo-upload-details">
					<FormFileUpload
						accept={ ALLOWED_FILE_TYPES.join( ',' ) }
						onChange={ handleFileSelect }
						ref={ fileInputRef }
					>
						<Button variant="secondary">
							{ displayUrl ? translate( 'Replace file' ) : translate( 'Select file' ) }
						</Button>
					</FormFileUpload>

					<p className="help-text">
						{ translate( 'Upload your logo. PNG or SVG. Max 5 MB.' ) }
						<br />
						{ translate( 'Transparent background works best.' ) }
					</p>

					{ hasCustomLogo && (
						<>
							<p className="help-text">
								{ translate( 'Replacing the logo only affects this referral.' ) }
							</p>
							<Button variant="link" onClick={ handleRevert }>
								{ translate( 'Revert to profile logo' ) }
							</Button>
						</>
					) }

					{ validationError && (
						<div className="logo-upload-error" role="alert">
							{ validationError }
						</div>
					) }
				</div>
			</div>
		</div>
	);
}

export default ReferralLogoPicker;
