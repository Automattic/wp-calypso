import { Button, FormLabel } from '@automattic/components';
import { upload } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useCallback, useRef, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadio from 'calypso/components/forms/form-radio';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';

interface ReferralLogoPickerProps {
	onLogoChange: ( logoUrl: string | null, logoFile: File | null ) => void;
	selectedLogoUrl: string | null;
	selectedLogoFile: File | null;
}

type LogoSelectionType = 'profile' | 'custom';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [ 'image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml' ];

function ReferralLogoPicker( {
	onLogoChange,
	selectedLogoUrl,
	selectedLogoFile,
}: ReferralLogoPickerProps ) {
	const translate = useTranslate();
	const agency = useSelector( getActiveAgency );
	const fileInputRef = useRef< HTMLInputElement >( null );

	const profileLogoUrl = agency?.profile?.company_details?.logo_url || '';
	const hasProfileLogo = !! profileLogoUrl;

	const [ selectionType, setSelectionType ] = useState< LogoSelectionType >(
		hasProfileLogo ? 'profile' : 'custom'
	);
	const [ validationError, setValidationError ] = useState< string | null >( null );
	const [ previewUrl, setPreviewUrl ] = useState< string | null >( null );

	const handleSelectionChange = useCallback(
		( type: LogoSelectionType ) => {
			setSelectionType( type );
			setValidationError( null );

			if ( type === 'profile' && hasProfileLogo ) {
				// Use profile logo
				setPreviewUrl( null );
				onLogoChange( profileLogoUrl, null );
			} else {
				// Custom logo selected but no file yet
				if ( ! selectedLogoFile ) {
					onLogoChange( null, null );
				}
			}
		},
		[ hasProfileLogo, profileLogoUrl, onLogoChange, selectedLogoFile ]
	);

	const validateFile = useCallback(
		( file: File ): string | null => {
			if ( ! ALLOWED_FILE_TYPES.includes( file.type ) ) {
				return translate(
					'Invalid file format. Please upload a JPG, PNG, or SVG file.'
				);
			}

			if ( file.size > MAX_FILE_SIZE ) {
				return translate( 'File size exceeds 5MB. Please upload a smaller file.' );
			}

			return null;
		},
		[ translate ]
	);

	const handleFileChange = useCallback(
		( event: ChangeEvent< HTMLInputElement > ) => {
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
		},
		[ validateFile, onLogoChange ]
	);

	const handleUploadClick = useCallback( () => {
		fileInputRef.current?.click();
	}, [] );

	const handleDrop = useCallback(
		( event: React.DragEvent< HTMLDivElement > ) => {
			event.preventDefault();
			event.stopPropagation();

			const file = event.dataTransfer.files?.[ 0 ];
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
		},
		[ validateFile, onLogoChange ]
	);

	const handleDragOver = useCallback( ( event: React.DragEvent< HTMLDivElement > ) => {
		event.preventDefault();
		event.stopPropagation();
	}, [] );

	const displayLogoUrl = previewUrl || selectedLogoUrl;

	return (
		<div className="referral-logo-picker">
			<FormFieldset>
				<FormLabel>{ translate( 'Your logo' ) }</FormLabel>

				<div className="referral-logo-picker__options">
					{ hasProfileLogo && (
						<div className="referral-logo-picker__option">
							<FormRadio
								id="logo-profile"
								name="logo-selection"
								value="profile"
								checked={ selectionType === 'profile' }
								onChange={ () => handleSelectionChange( 'profile' ) }
								label={ translate( 'Use profile logo' ) }
							/>
							{ selectionType === 'profile' && (
								<div className="referral-logo-picker__preview">
									<img src={ profileLogoUrl } alt={ translate( 'Profile logo' ) } />
								</div>
							) }
						</div>
					) }

					<div className="referral-logo-picker__option">
						<FormRadio
							id="logo-custom"
							name="logo-selection"
							value="custom"
							checked={ selectionType === 'custom' }
							onChange={ () => handleSelectionChange( 'custom' ) }
							label={ translate( 'Use a different logo for this referral' ) }
						/>

						{ selectionType === 'custom' && (
							<div className="referral-logo-picker__upload-area">
								<input
									ref={ fileInputRef }
									type="file"
									accept={ ALLOWED_FILE_TYPES.join( ',' ) }
									onChange={ handleFileChange }
									className="referral-logo-picker__file-input"
								/>

								{ ! displayLogoUrl ? (
									<div
										className="referral-logo-picker__dropzone"
										onDrop={ handleDrop }
										onDragOver={ handleDragOver }
									>
										<p className="referral-logo-picker__dropzone-text">
											{ translate( 'Drag and drop your logo here, or' ) }
										</p>
										<Button onClick={ handleUploadClick } icon={ upload }>
											{ translate( 'Select file' ) }
										</Button>
										<p className="referral-logo-picker__dropzone-hint">
											{ translate( 'JPG, PNG, or SVG (max 5MB)' ) }
										</p>
									</div>
								) : (
									<div className="referral-logo-picker__preview-container">
										<div className="referral-logo-picker__preview">
											<img src={ displayLogoUrl } alt={ translate( 'Selected logo' ) } />
										</div>
										<Button onClick={ handleUploadClick } compact>
											{ translate( 'Change logo' ) }
										</Button>
									</div>
								) }

								{ validationError && (
									<div className="referral-logo-picker__error" role="alert">
										{ validationError }
									</div>
								) }
							</div>
						) }
					</div>
				</div>

				{ ! hasProfileLogo && (
					<p className="referral-logo-picker__info-text">
						{ translate(
							'This logo will be saved to your profile and used for future referrals.'
						) }
					</p>
				) }
			</FormFieldset>
		</div>
	);
}

export default ReferralLogoPicker;
