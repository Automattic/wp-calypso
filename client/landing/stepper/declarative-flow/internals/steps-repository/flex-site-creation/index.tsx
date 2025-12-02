import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Step } from '@automattic/onboarding';
import { TextControl, Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { FormEvent, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import type { Step as StepType } from '../../types';
import './style.scss';

const FlexSiteCreation: StepType< {
	submits: {
		siteName: string;
	};
} > = function FlexSiteCreation( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();

	const [ siteName, setSiteName ] = useState( '' );
	const [ isLoading, setIsLoading ] = useState( false );

	const handleSubmit = ( event: FormEvent ) => {
		event.preventDefault();

		if ( ! siteName.trim() ) {
			return;
		}

		setIsLoading( true );

		submit?.( {
			siteName,
		} );
	};

	return (
		<>
			<DocumentHead title={ __( 'Create a new site' ) } />
			<Step.CenteredColumnLayout
				className="flex-site-creation"
				columnWidth={ 6 }
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

						<Button
							className="flex-site-creation__submit-button"
							variant="primary"
							type="submit"
							disabled={ isLoading }
						>
							{ __( 'Create a site' ) }
						</Button>
					</div>

					<div className="flex-site-creation__footer">
						<span className="flex-site-creation__footer-text">
							{ __( 'Already have an existing site?' ) }
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
