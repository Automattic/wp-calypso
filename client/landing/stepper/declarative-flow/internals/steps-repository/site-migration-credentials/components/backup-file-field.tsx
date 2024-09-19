import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Controller } from 'react-hook-form';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { isValidUrl } from 'calypso/lib/importer/url-validation';
import { CredentialsFormFieldProps } from '../types';
import { ErrorMessage } from './error-message';

export const BackupFileField: React.FC< CredentialsFormFieldProps > = ( { control, errors } ) => {
	const translate = useTranslate();

	const isBackupFileLocationValid = ( fileLocation: string ) => {
		return ! isValidUrl( fileLocation ) ? translate( 'Please enter a valid URL.' ) : undefined;
	};

	return (
		<div className="site-migration-credentials">
			<div className="site-migration-credentials__form">
				<div className="site-migration-credentials__form-field">
					<FormLabel htmlFor="backup-file">{ translate( 'Backup file location' ) }</FormLabel>
					<Controller
						control={ control }
						name="backupFileLocation"
						rules={ {
							required: translate( 'Please enter a valid URL.' ),
							validate: isBackupFileLocationValid,
						} }
						render={ ( { field } ) => (
							<FormTextInput
								id="backup-file"
								type="text"
								isError={ !! errors?.backupFileLocation }
								placeholder={ translate( 'Enter your backup file location' ) }
								{ ...field }
							/>
						) }
					/>
				</div>
				<ErrorMessage error={ errors?.backupFileLocation } />
				<div className="site-migration-credentials__form-note site-migration-credentials__backup-note">
					{ translate(
						"Upload your file to a service like Dropbox or Google Drive to get a link. Don't forget to make sure that anyone with the link can access it."
					) }
				</div>
			</div>
		</div>
	);
};
