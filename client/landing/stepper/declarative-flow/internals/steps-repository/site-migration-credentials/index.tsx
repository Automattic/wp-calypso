import { FormLabel } from '@automattic/components';
import Card from '@automattic/components/src/card';
import { NextButton, StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useState, type FC } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import FormRadio from 'calypso/components/forms/form-radio';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

import './style.scss';

interface CredentialsFormProps {
	onSubmit: () => void;
}

export const CredentialsForm: FC< CredentialsFormProps > = ( { onSubmit } ) => {
	const translate = useTranslate();

	const [ accessMethod, setAccessMethod ] = useState< string >( 'credentials' );
	const [ siteAddress, setSiteAddress ] = useState< string >( '' );
	const [ username, setUsername ] = useState< string >( '' );
	const [ password, setPassword ] = useState< string >( '' );
	const [ backupFileLocation, setBackupFileLocation ] = useState< string >( '' );

	const handleAccessMethodChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setAccessMethod( event.target.value );
	};

	const handleSubmit = () => {
		// Handle form submission logic here
		onSubmit();
	};

	return (
		<form onSubmit={ handleSubmit }>
			<Card>
				<div>
					<FormLabel>{ translate( 'How can we access your site?' ) }</FormLabel>
					<div>
						<FormRadio
							label={ translate( 'WordPress credentials' ) }
							value="credentials"
							name="how-to-access-site"
							checked={ accessMethod === 'credentials' }
							onChange={ handleAccessMethodChange }
							disabled={ false }
						/>
					</div>
					<div>
						<FormRadio
							label={ translate( 'Backup file' ) }
							value="backup"
							name="how-to-access-site"
							checked={ accessMethod === 'backup' }
							onChange={ handleAccessMethodChange }
							disabled={ false }
						/>
					</div>
				</div>
				<hr />
				{ accessMethod === 'credentials' && (
					<div className="site-migration-credentials">
						<div className="site-migration-credentials__form">
							<div className="site-migration-credentials__form-field">
								<FormLabel htmlFor="site-address">{ translate( 'Site address' ) }</FormLabel>
								<FormTextInput
									type="text"
									id="site-address"
									value={ siteAddress }
									onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
										setSiteAddress( e.target.value )
									}
								/>
							</div>
							<div className="site-migration-credentials__form-field">
								<FormLabel htmlFor="username">{ translate( 'Username' ) }</FormLabel>
								<FormTextInput
									type="text"
									id="username"
									value={ username }
									onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
										setUsername( e.target.value )
									}
								/>
							</div>
							<div className="site-migration-credentials__form-field">
								<FormLabel htmlFor="password">{ translate( 'Password' ) }</FormLabel>
								<FormTextInput
									type="password"
									id="password"
									value={ password }
									onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
										setPassword( e.target.value )
									}
								/>
							</div>
						</div>
					</div>
				) }
				{ accessMethod === 'backup' && (
					<div className="site-migration-credentials">
						<div className="site-migration-credentials__form">
							<div className="site-migration-credentials__form-field">
								<FormLabel htmlFor="backup-file">{ translate( 'Backup file location' ) }</FormLabel>
								<FormTextInput
									type="text"
									id="backup-file"
									value={ backupFileLocation }
									onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
										setBackupFileLocation( e.target.value )
									}
									placeholder={ translate( 'Enter your backup file location' ) }
								/>
							</div>
							<div>
								{ translate(
									'Share a link to your backup file, hosted on a service like Dropbox or Google Drive, ensuring that anyone with the link has access to the file.'
								) }
							</div>
						</div>
					</div>
				) }
				<div>
					<NextButton type="submit">{ translate( 'Continue' ) }</NextButton>
				</div>
			</Card>
		</form>
	);
};

export type SiteMigrationIdentifyAction = 'continue' | 'skip_platform_identification';

const SiteMigrationCredentials: Step = function ( { navigation } ) {
	const translate = useTranslate();

	const handleSubmit = () => {
		return navigation.submit?.();
	};

	return (
		<>
			<DocumentHead title={ translate( 'Tell us about your site' ) } />
			<StepContainer
				stepName="site-migration-credentials"
				flowName="site-migration"
				goBack={ navigation?.goBack }
				goNext={ navigation?.submit }
				isFullLayout
				formattedHeader={
					<FormattedHeader
						id="site-migration-credentials-header"
						headerText={ translate( 'Tell us about your site' ) }
						subHeaderText={ translate(
							'Please share the following details to access your site and start your migration.'
						) }
						align="center"
					/>
				}
				stepContent={ <CredentialsForm onSubmit={ handleSubmit } /> }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationCredentials;
