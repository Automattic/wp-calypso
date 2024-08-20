import { FormLabel } from '@automattic/components';
import Card from '@automattic/components/src/card';
import { NextButton, StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useEffect, type FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import getValidationMessage from 'calypso/blocks/import/capture/url-validation-message-helper';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import FormRadio from 'calypso/components/forms/form-radio';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextArea from 'calypso/components/forms/form-textarea';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isValidUrl } from 'calypso/lib/importer/url-validation';
import { CredentialsFormData, MigrationError } from './types';
import { useSiteMigrationCredentialsMutation } from './use-site-migration-credentials-mutation';
import type { Step } from '../../types';
import './style.scss';

interface CredentialsFormProps {
	onSubmit: () => void;
}

const mapApiError = ( error: any ) => {
	return {
		body: {
			code: error.code,
			message: error.message,
			data: error.data,
		},
		status: error.status,
	};
};

export const CredentialsForm: FC< CredentialsFormProps > = ( { onSubmit } ) => {
	const translate = useTranslate();

	const validateSiteAddress = ( siteAddress: string ) => {
		const isSiteAddressValid = CAPTURE_URL_RGX.test( siteAddress );

		if ( ! isSiteAddressValid ) {
			return getValidationMessage( siteAddress, translate );
		}
	};

	const fieldMapping = {
		from_url: {
			fieldName: 'siteAddress',
			errorMessage: translate( 'Please enter a valid URL.' ),
		},
		username: {
			fieldName: null,
			errorMessage: translate( 'Enter a valid username' ),
		},
		password: {
			fieldName: null,
			errorMessage: translate( 'Enter a valid password' ),
		},
	};

	const isBackupFileLocationValid = ( fileLocation: string ) => {
		return ! isValidUrl( fileLocation ) ? fieldMapping.from_url.errorMessage : undefined;
	};

	const importSiteQueryParam = useQuery().get( 'from' ) || '';

	const handleMigrationError = ( err: MigrationError ) => {
		if ( err.body?.code === 'rest_invalid_param' && err.body?.data?.params ) {
			Object.entries( err.body.data.params ).forEach( ( [ key ] ) => {
				const field = fieldMapping[ key as keyof typeof fieldMapping ];
				const keyName = field?.fieldName ?? key;
				const message = field?.errorMessage ?? translate( 'Invalid input, please check again' );
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				setError( keyName as keyof CredentialsFormData, {
					type: 'manual',
					message,
				} );
			} );
		} else {
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			setError( 'root', {
				type: 'manual',
				message: err.body?.message ?? translate( 'An error occurred while saving credentials.' ),
			} );
		}
	};

	const { isPending, requestAutomatedMigration } = useSiteMigrationCredentialsMutation( {
		onSuccess: () => {
			recordTracksEvent( 'calypso_site_migration_automated_request_success' );
			onSubmit();
		},
		onError: ( error ) => {
			handleMigrationError( mapApiError( error ) );
			recordTracksEvent( 'calypso_site_migration_automated_request_error' );
		},
	} );

	const {
		formState: { errors },
		control,
		handleSubmit,
		watch,
		setError,
		clearErrors,
	} = useForm< CredentialsFormData >( {
		mode: 'onSubmit',
		reValidateMode: 'onSubmit',
		disabled: isPending,
		defaultValues: {
			siteAddress: importSiteQueryParam,
			username: '',
			password: '',
			backupFileLocation: '',
			notes: '',
			howToAccessSite: 'credentials',
		},
	} );

	// Clear any root errors when the user changes any field.
	useEffect( () => {
		const { unsubscribe } = watch( () => {
			clearErrors( 'root' );
		} );
		return () => unsubscribe();
	}, [ watch, clearErrors ] );

	// Subscribe only this field to the access method value.
	const accessMethod = watch( 'howToAccessSite' );

	const submitHandler = ( data: CredentialsFormData ) => {
		requestAutomatedMigration( data );
	};

	return (
		<form onSubmit={ handleSubmit( submitHandler ) }>
			<Card>
				<div>
					<FormLabel>{ translate( 'How can we access your site?' ) }</FormLabel>
					<div className="site-migration-credentials__radio">
						<Controller
							control={ control }
							name="howToAccessSite"
							defaultValue="credentials"
							render={ ( { field: { value, ...props } } ) => (
								<FormRadio
									id="site-migration-credentials__radio-credentials"
									htmlFor="site-migration-credentials__radio-credentials"
									label={ translate( 'WordPress credentials' ) }
									checked={ value === 'credentials' }
									{ ...props }
									value="credentials"
									ref={ null }
								/>
							) }
						/>
					</div>
					<div className="site-migration-credentials__radio">
						<Controller
							control={ control }
							name="howToAccessSite"
							defaultValue="backup"
							render={ ( { field: { value, onBlur, ...props } } ) => (
								<FormRadio
									id="site-migration-credentials__radio-backup"
									htmlFor="site-migration-credentials__radio-backup"
									{ ...props }
									checked={ value === 'backup' }
									value="backup"
									label={ translate( 'Backup file' ) }
									ref={ null }
								/>
							) }
						/>
					</div>
				</div>
				<hr />
				{ accessMethod === 'credentials' && (
					<div className="site-migration-credentials">
						<div className="site-migration-credentials__form">
							<div className="site-migration-credentials__form-field">
								<FormLabel htmlFor="site-address">{ translate( 'Site address' ) }</FormLabel>
								<Controller
									control={ control }
									name="siteAddress"
									rules={ {
										required: translate( 'Please enter your WordPress site address.' ),
										validate: validateSiteAddress,
									} }
									render={ ( { field } ) => (
										<FormTextInput
											id="site-address"
											placeholder={ translate( 'Enter your WordPress site address.' ) }
											type="text"
											{ ...field }
										/>
									) }
								/>

								{ errors?.siteAddress && (
									<div className="site-migration-credentials__form-error">
										{ errors.siteAddress.message }
									</div>
								) }
							</div>

							<div className="site-migration-credentials__form-fields-row">
								<div className="site-migration-credentials__form-field">
									<FormLabel htmlFor="username">
										{ translate( 'WordPress admin username' ) }
									</FormLabel>
									<Controller
										control={ control }
										name="username"
										rules={ {
											required: translate( 'Please enter your WordPress admin username.' ),
										} }
										render={ ( { field } ) => (
											<FormTextInput
												id="username"
												type="text"
												placeholder={ translate( 'Username' ) }
												{ ...field }
												onChange={ ( e: any ) => {
													const trimmedValue = e.target.value.trim();
													field.onChange( trimmedValue );
												} }
												onBlur={ ( e: any ) => {
													field.onBlur();
													e.target.value = e.target.value.trim();
												} }
											/>
										) }
									/>
								</div>
								<div className="site-migration-credentials__form-field">
									<FormLabel htmlFor="password">{ translate( 'Password' ) }</FormLabel>
									<Controller
										control={ control }
										name="password"
										rules={ {
											required: translate( 'Please enter your WordPress admin password.' ),
										} }
										render={ ( { field } ) => (
											<FormTextInput
												id="password"
												type="password"
												placeholder={ translate( 'Password' ) }
												{ ...field }
											/>
										) }
									/>
								</div>
							</div>

							{ ( errors.username || errors.password ) && (
								<div className="site-migration-credentials__form-error">
									{ errors.username?.message || errors.password?.message }
								</div>
							) }
						</div>
					</div>
				) }
				{ accessMethod === 'backup' && (
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
											type="text"
											placeholder={ translate( 'Enter your backup file location' ) }
											{ ...field }
										/>
									) }
								/>
							</div>
							{ errors?.backupFileLocation && (
								<div className="site-migration-credentials__form-error">
									{ errors.backupFileLocation?.message }
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
					<Controller
						control={ control }
						name="notes"
						render={ ( { field } ) => (
							<FormTextArea
								type="text"
								placeholder={ translate(
									'Share any other details that will help us access your site for the migration.'
								) }
								{ ...field }
								ref={ null }
							/>
						) }
					/>
				</div>
				{ errors?.root && (
					<div className="site-migration-credentials__form-error">{ errors.root.message }</div>
				) }
				<div>
					<NextButton disabled={ isPending } type="submit">
						{ translate( 'Continue' ) }
					</NextButton>
				</div>
			</Card>
			<div className="site-migration-credentials__skip">
				<button
					className="button navigation-link step-container__navigation-link has-underline is-borderless"
					disabled={ isPending }
				>
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
