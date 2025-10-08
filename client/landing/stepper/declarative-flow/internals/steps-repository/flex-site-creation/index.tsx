import { Step } from '@automattic/onboarding';
import { SelectControl, TextControl, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { FormEvent, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step as StepType } from '../../types';
import './style.scss';

const FlexSiteCreation: StepType< {
	submits: {
		siteName: string;
		siteType: string;
		dataCenter: string;
		phpVersion: string;
		wordpressVersion: string;
	};
} > = function FlexSiteCreation( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const { setSiteTitle } = useDispatch( ONBOARD_STORE );

	const [ siteName, setSiteName ] = useState( '' );
	const [ siteType, setSiteType ] = useState( 'production' );
	const [ dataCenter, setDataCenter ] = useState( 'default' );
	const [ phpVersion, setPhpVersion ] = useState( '8.3' );
	const [ wordpressVersion, setWordpressVersion ] = useState( 'latest' );
	const [ isLoading, setIsLoading ] = useState( false );

	const siteTypeOptions = [
		{ label: __( 'Production' ), value: 'production' },
		{ label: __( 'Staging' ), value: 'staging' },
		{ label: __( 'Development' ), value: 'development' },
	];

	const dataCenterOptions = [
		{ label: __( 'Default' ), value: 'default' },
		{ label: __( 'US East' ), value: 'us-east' },
		{ label: __( 'US West' ), value: 'us-west' },
		{ label: __( 'Europe' ), value: 'europe' },
		{ label: __( 'Asia' ), value: 'asia' },
	];

	const phpVersionOptions = [
		{ label: '8.3', value: '8.3' },
		{ label: '8.2', value: '8.2' },
		{ label: '8.1', value: '8.1' },
		{ label: '8.0', value: '8.0' },
		{ label: '7.4', value: '7.4' },
	];

	const wordpressVersionOptions = [
		{ label: __( 'Latest' ), value: 'latest' },
		{ label: '6.5', value: '6.5' },
		{ label: '6.4', value: '6.4' },
		{ label: '6.3', value: '6.3' },
	];

	const handleSubmit = ( event: FormEvent ) => {
		event.preventDefault();

		if ( ! siteName.trim() ) {
			return;
		}

		setIsLoading( true );

		// Store site title in ONBOARD_STORE so create-site step can use it
		setSiteTitle( siteName );

		recordTracksEvent( 'calypso_flex_site_creation_submit', {
			site_name: siteName,
			site_type: siteType,
			data_center: dataCenter,
			php_version: phpVersion,
			wordpress_version: wordpressVersion,
		} );

		submit?.( {
			siteName,
			siteType,
			dataCenter,
			phpVersion,
			wordpressVersion,
		} );
	};

	const isSiteNameEmpty = ! siteName.trim();

	return (
		<>
			<DocumentHead title={ __( 'Create a new site' ) } />
			<Step.CenteredColumnLayout
				className="flex-site-creation"
				columnWidth={ 5 }
				topBar={
					<Step.TopBar
						leftElement={
							<Step.BackButton href="/sites">{ __( 'Back to sites' ) }</Step.BackButton>
						}
					/>
				}
				heading={
					<Step.Heading
						text={ __( 'Create a new site' ) }
						subText={ __( 'No-hassle WordPress install in one click.' ) }
					/>
				}
			>
				<form className="flex-site-creation__form" onSubmit={ handleSubmit }>
					<div className="flex-site-creation__card">
						<FormFieldset>
							<TextControl
								label={ __( 'Site name' ) }
								value={ siteName }
								onChange={ ( value: string ) => setSiteName( value ) }
								placeholder={ __( 'Enter site name' ) }
								// eslint-disable-next-line jsx-a11y/no-autofocus
								autoFocus
								__nextHasNoMarginBottom
							/>
						</FormFieldset>

						<div className="flex-site-creation__form-row">
							<FormFieldset className="flex-site-creation__form-field">
								<SelectControl
									label={ __( 'Site type' ) }
									value={ siteType }
									options={ siteTypeOptions }
									onChange={ ( value: string ) => setSiteType( value ) }
									__nextHasNoMarginBottom
								/>
							</FormFieldset>

							<FormFieldset className="flex-site-creation__form-field">
								<SelectControl
									label={ __( 'Data center (optional)' ) }
									value={ dataCenter }
									options={ dataCenterOptions }
									onChange={ ( value: string ) => setDataCenter( value ) }
									__nextHasNoMarginBottom
								/>
							</FormFieldset>
						</div>

						<div className="flex-site-creation__form-row">
							<FormFieldset className="flex-site-creation__form-field">
								<SelectControl
									label={ __( 'PHP version' ) }
									value={ phpVersion }
									options={ phpVersionOptions }
									onChange={ ( value: string ) => setPhpVersion( value ) }
									__nextHasNoMarginBottom
								/>
							</FormFieldset>

							<FormFieldset className="flex-site-creation__form-field">
								<SelectControl
									label={ __( 'WordPress version' ) }
									value={ wordpressVersion }
									options={ wordpressVersionOptions }
									onChange={ ( value: string ) => setWordpressVersion( value ) }
									__nextHasNoMarginBottom
								/>
							</FormFieldset>
						</div>

						<Button
							className="flex-site-creation__submit-button"
							variant="primary"
							type="submit"
							disabled={ isSiteNameEmpty || isLoading }
						>
							{ isLoading ? __( 'Creating...' ) : __( 'Create a site' ) }
						</Button>
					</div>

					<div className="flex-site-creation__footer">
						<span className="flex-site-creation__footer-text">
							{ __( 'Already have an existing site?' ) }{ ' ' }
						</span>
						<a
							href="/setup/site-migration-flow"
							className="flex-site-creation__footer-link"
							onClick={ () => {
								recordTracksEvent( 'calypso_flex_site_creation_migration_link_click' );
							} }
						>
							{ __( 'Migrate it to WordPress.com' ) }
						</a>
					</div>
				</form>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default FlexSiteCreation;
