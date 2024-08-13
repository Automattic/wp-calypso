import { FormLabel } from '@automattic/components';
import Card from '@automattic/components/src/card';
import { NextButton, StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useState, type FC } from 'react';
import getValidationMessage from 'calypso/blocks/import/capture/url-validation-message-helper';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import FormRadio from 'calypso/components/forms/form-radio';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextArea from 'calypso/components/forms/form-textarea';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isValidUrl } from 'calypso/lib/importer/url-validation';
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
	const [ notes, setNotes ] = useState< string >( '' );
	const [ errors, setError ] = useState< Record< string, string > >();

	const handleAccessMethodChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setAccessMethod( event.target.value );
	};

	const validateCredentials = () => {
		const credentialsErrors: Record< string, string > = {};
		const isSiteAddressValid = CAPTURE_URL_RGX.test( siteAddress );

		if ( ! isSiteAddressValid ) {
			const siteAddressError = getValidationMessage( siteAddress, translate );
			credentialsErrors.siteAddress = siteAddressError;
		}

		if ( ! username || ! password ) {
			credentialsErrors.credentials = translate(
				'Enter your WordPress admin username and password.'
			);
		}

		return credentialsErrors;
	};

	const handleSubmit = ( e: any ) => {
		e.preventDefault();
		setError( {} );
		if ( accessMethod === 'credentials' ) {
			const credentialsErrors = validateCredentials();
			if ( Object.keys( credentialsErrors ).length ) {
				setError( credentialsErrors );
				return;
			}
		} else if ( accessMethod === 'backup' ) {
			if ( ! isValidUrl( backupFileLocation ) ) {
				setError( { backupFileLocation: translate( 'Please enter a valid URL' ) } );
				return;
			}
		}
		onSubmit();
	};

	return (
		<form onSubmit={ handleSubmit }>
			<Card>
				<div>
					<FormLabel>{ translate( 'How can we access your site?' ) }</FormLabel>
					<div className="site-migration-credentials__radio">
						<FormRadio
							label={ translate( 'WordPress credentials' ) }
							value="credentials"
							name="how-to-access-site"
							checked={ accessMethod === 'credentials' }
							onChange={ handleAccessMethodChange }
							disabled={ false }
						/>
					</div>
					<div className="site-migration-credentials__radio">
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
									placeholder={ translate( 'Enter your WordPress site address.' ) }
									onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
										setSiteAddress( e.target.value )
									}
								/>
								{ errors?.siteAddress && (
									<div className="site-migration-credentials__form-error">
										{ errors.siteAddress }
									</div>
								) }
							</div>

							<div className="site-migration-credentials__form-fields-row">
								<div className="site-migration-credentials__form-field">
									<FormLabel htmlFor="username">
										{ translate( 'WordPress admin username' ) }
									</FormLabel>
									<FormTextInput
										type="text"
										id="username"
										value={ username }
										placeholder={ translate( 'Username' ) }
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
										placeholder={ translate( 'Password' ) }
										onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
											setPassword( e.target.value )
										}
									/>
								</div>
							</div>

							{ errors?.credentials && (
								<div className="site-migration-credentials__form-error">{ errors.credentials }</div>
							) }
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
							{ errors?.backupFileLocation && (
								<div className="site-migration-credentials__form-error">
									{ errors.backupFileLocation }
								</div>
							) }
							<div className="site-migration-credentials__form-note">
								{ translate(
									"Upload your file to a service like Dropbox or Google Drive to get a link. Don't forget to make sure that anyone with the link can access it."
								) }
							</div>
						</div>
					</div>
				) }

				<div className="site-migration-credentials__form-field">
					<FormLabel htmlFor="site-address">{ translate( 'Notes (optional)' ) }</FormLabel>
					<FormTextArea
						type="text"
						id="site-address"
						placeholder={ translate(
							'Share any other details that will help us access your site for the migration.'
						) }
						value={ notes }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) => setNotes( e.target.value ) }
					/>
				</div>
				<div>
					<NextButton type="submit">{ translate( 'Continue' ) }</NextButton>
				</div>
			</Card>
			<div className="site-migration-credentials__skip">
				<button className="button navigation-link step-container__navigation-link has-underline is-borderless">
					{ translate( 'Skip, I need help providing access' ) }
				</button>
			</div>
		</form>
	);
};

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
				hideSkip
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
