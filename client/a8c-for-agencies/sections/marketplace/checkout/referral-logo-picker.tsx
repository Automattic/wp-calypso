import { FormLabel } from '@automattic/components';
import { Button } from '@wordpress/components';
import { upload } from '@wordpress/icons';
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
				return translate( 'Invalid file format. Please upload a PNG or SVG file.' );
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

	const handleSelectFileClick = useCallback( () => {
		fileInputRef.current?.click();
	}, [] );

	const displayLogoUrl = selectionType === 'profile' ? profileLogoUrl : previewUrl || selectedLogoUrl;

	return (
		<div className="referral-logo-picker">
			<FormFieldset>
				<FormLabel>{ translate( 'Your logo' ) }</FormLabel>
				<p className="referral-logo-picker__description">
					{ translate( 'Build trust and show this referral comes from you.' ) }
				</p>

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
							{ selectionType === 'profile' && displayLogoUrl && (
								<div className="referral-logo-picker__logo-display">
									<img src={ displayLogoUrl } alt={ translate( 'Profile logo' ) } />
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
							<div className="referral-logo-picker__upload-section">
								<input
									ref={ fileInputRef }
									type="file"
									accept={ ALLOWED_FILE_TYPES.join( ',' ) }
									onChange={ handleFileChange }
									className="referral-logo-picker__file-input"
								/>

								{ displayLogoUrl ? (
									<div className="referral-logo-picker__logo-display">
										<img src={ displayLogoUrl } alt={ translate( 'Selected logo' ) } />
									</div>
								) : (
									<div className="referral-logo-picker__upload-placeholder">
										<span className="referral-logo-picker__upload-icon">
											<svg
												width="24"
												height="24"
												viewBox="0 0 24 24"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M12 4L12 16M12 4L8 8M12 4L16 8"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
												<path
													d="M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
												/>
											</svg>
										</span>
									</div>
								) }

								<Button variant="secondary" onClick={ handleSelectFileClick }>
									{ translate( 'Select file' ) }
								</Button>

								<p className="referral-logo-picker__upload-hint">
									{ translate( 'Upload your logo: PNG or SVG. Max 5 MB. Transparent background works best.' ) }
								</p>

								{ validationError && (
									<div className="referral-logo-picker__error" role="alert">
										{ validationError }
									</div>
								) }
							</div>
						) }
					</div>
				</div>
			</FormFieldset>
		</div>
	);
}

export default ReferralLogoPicker;
