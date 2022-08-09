/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button, FormInputValidation } from '@automattic/components';
import { useSiteLogoMutation } from '@automattic/data-stores';
import { StepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import React, { FormEvent, useEffect } from 'react';
import greenCheckmarkImg from 'calypso/assets/images/onboarding/green-checkmark.svg';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormInput from 'calypso/components/forms/form-text-input';
import { SiteIconWithPicker } from 'calypso/components/site-icon-with-picker';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import type { Step } from '../../types';

import './styles.scss';

const LinkInBioSetup: Step = function LinkInBioSetup( { navigation } ) {
	const { submit, goBack } = navigation;
	const { __ } = useI18n();
	const site = useSite();

	const [ formTouched, setFormTouched ] = React.useState( false );
	const [ selectedFile, setSelectedFile ] = React.useState< File | undefined >();
	const [ siteTitle, setSiteTitle ] = React.useState( '' );
	const [ tagline, setTagline ] = React.useState( '' );
	const [ url, setUrl ] = React.useState( '' );

	const { saveSiteSettings } = useDispatch( SITE_STORE );
	const { mutateAsync: setSiteLogo, isLoading: isUploadingIcon } = useSiteLogoMutation( site?.ID );
	const isLoading = ! site || isUploadingIcon;
	const siteTitleError = formTouched && ! siteTitle.trim();

	useEffect( () => {
		if ( ! site ) {
			return;
		}

		if ( formTouched ) {
			return;
		}

		setSiteTitle( site.name || '' );
		setTagline( site.description );
		setUrl( new URL( site.URL ).host );
	}, [ site, formTouched ] );

	const onChange = ( event: React.FormEvent< HTMLInputElement > ) => {
		if ( site ) {
			setFormTouched( true );
			switch ( event.currentTarget.name ) {
				case 'link-in-bio-input-name':
					return setSiteTitle( event.currentTarget.value );
				case 'link-in-bio-input-description':
					return setTagline( event.currentTarget.value );
			}
		}
	};

	const handleSubmit = async ( event: FormEvent ) => {
		event.preventDefault();
		if ( site ) {
			await saveSiteSettings( site.ID, {
				blogname: siteTitle,
				blogdescription: tagline,
			} );
			recordTracksEvent( 'calypso_signup_site_options_submit', {
				has_site_title: !! siteTitle,
				has_tagline: !! tagline,
			} );

			if ( selectedFile ) {
				try {
					await setSiteLogo( selectedFile );
				} catch ( _error ) {
					// communicate the error to the user
				}
			}

			submit?.( { siteTitle, tagline } );
		}
	};
	const stepContent = (
		<div className="step-container">
			<form onSubmit={ handleSubmit }>
				<div className="link-in-bio-setup__form">
					<SiteIconWithPicker
						site={ site }
						onSelect={ setSelectedFile }
						selectedFile={ selectedFile }
					/>
					<FormFieldset disabled={ isLoading }>
						<FormLabel htmlFor="link-in-bio-input-name">{ __( 'Site name' ) }</FormLabel>
						<FormInput
							name="link-in-bio-input-name"
							id="link-in-bio-input-name"
							value={ siteTitle }
							onChange={ onChange }
							style={ {
								backgroundImage: siteTitle.trim() ? `url(${ greenCheckmarkImg })` : 'unset',
								backgroundRepeat: 'no-repeat',
								backgroundPosition: '95%',
								paddingRight: ' 40px',
							} }
							isError={ siteTitleError }
						/>
						{ siteTitleError && (
							<FormInputValidation
								isError
								text={ __( 'Your site needs a name so your subscribers can identify you.' ) }
							/>
						) }
					</FormFieldset>

					<FormFieldset disabled={ isLoading }>
						<FormLabel htmlFor="link-in-bio-input-description">
							{ __( 'Brief description' ) }
						</FormLabel>
						<FormInput
							name="link-in-bio-input-description"
							id="link-in-bio-input-description"
							value={ tagline }
							onChange={ onChange }
							style={ {
								backgroundImage: tagline.trim() ? `url(${ greenCheckmarkImg })` : 'unset',
								backgroundRepeat: 'no-repeat',
								backgroundPosition: '95%',
								paddingRight: ' 40px',
							} }
							isError={ false }
						/>
					</FormFieldset>
					<FormFieldset disabled={ isLoading }>
						<FormLabel htmlFor="inputId">{ __( 'Publication address' ) }</FormLabel>
						<div className="link-in-bio-setup-form-field__container">
							<div className="link-in-bio-setup-form-container__address">
								{ url }
								<button className="link-in-bio-setup-form__button">{ __( 'Change' ) }</button>
							</div>
						</div>
					</FormFieldset>
				</div>
				<Button className="link-in-bio-setup-form__submit" primary type="submit">
					{ __( 'Continue' ) }
				</Button>
			</form>
		</div>
	);

	return (
		<StepContainer
			stepName={ 'link-in-bio-setup' }
			goBack={ goBack }
			isWideLayout={ true }
			hideBack={ true }
			flowName={ 'linkInBio' }
			formattedHeader={
				<FormattedHeader
					id={ 'link-in-bio-setup-header' }
					headerText={ __( 'Set up Link in Bio' ) }
					align={ 'center' }
				/>
			}
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default LinkInBioSetup;
