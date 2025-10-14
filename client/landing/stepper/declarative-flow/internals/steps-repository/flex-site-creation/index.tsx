import { Step } from '@automattic/onboarding';
import { TextControl, Button } from '@wordpress/components';
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
	};
} > = function FlexSiteCreation( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const { setSiteTitle } = useDispatch( ONBOARD_STORE );

	const [ siteName, setSiteName ] = useState( '' );
	const [ isLoading, setIsLoading ] = useState( false );

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
		} );

		submit?.( {
			siteName,
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

						<div className="flex-site-creation__form-row" />

						<Button
							className="flex-site-creation__submit-button"
							variant="primary"
							type="submit"
							disabled={ isSiteNameEmpty || isLoading }
						>
							{ __( 'Create a site' ) }
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
