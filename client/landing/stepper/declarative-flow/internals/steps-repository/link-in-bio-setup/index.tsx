/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button, FormInputValidation } from '@automattic/components';
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
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import type { Step } from '../../types';

import './styles.scss';

const LinkInBioSetup: Step = function LinkInBioSetup( { navigation } ) {
	const { goBack, submit } = navigation;
	const { __ } = useI18n();
	const site = useSite();

	const usesSite = !! useSiteSlugParam();
	const [ formTouched, setFormTouched ] = React.useState( false );
	const [ selectedFile, setSelectedFile ] = React.useState< File | undefined >();
	const [ base64Image, setBase64Image ] = React.useState< string | null >();
	const [ siteTitle, setComponentSiteTitle ] = React.useState( '' );
	const [ tagline, setTagline ] = React.useState( '' );
	const { setSiteTitle, setSiteDescription, setSiteLogo } = useDispatch( ONBOARD_STORE );

	const siteTitleError = formTouched && ! siteTitle.trim();

	useEffect( () => {
		if ( ! site ) {
			return;
		}

		if ( formTouched ) {
			return;
		}
		setComponentSiteTitle( site.name || '' );
		setTagline( site.description );
	}, [ site, formTouched ] );

	const onChange = ( event: React.FormEvent< HTMLInputElement > ) => {
		setFormTouched( true );
		switch ( event.currentTarget.name ) {
			case 'link-in-bio-input-name':
				return setComponentSiteTitle( event.currentTarget.value );
			case 'link-in-bio-input-description':
				return setTagline( event.currentTarget.value );
		}
	};

	const imageFileToBase64 = ( file: Blob ) => {
		const reader = new FileReader();
		reader.readAsDataURL( file );
		reader.onload = () => setBase64Image( reader.result as string );
		reader.onerror = () => setBase64Image( null );
	};

	const handleSubmit = async ( event: FormEvent ) => {
		event.preventDefault();
		setSiteDescription( tagline );
		setSiteTitle( siteTitle );

		if ( selectedFile && base64Image ) {
			try {
				setSiteLogo( base64Image );
			} catch ( _error ) {
				// communicate the error to the user
			}
		}
		submit?.( { siteTitle, tagline } );
	};

	const stepContent = (
		<div className="step-container">
			<form onSubmit={ handleSubmit }>
				<div className="link-in-bio-setup__form">
					<SiteIconWithPicker
						site={ site }
						onSelect={ ( file ) => {
							setSelectedFile( file );
							imageFileToBase64( file );
						} }
						disabled={ usesSite ? ! site : false }
						selectedFile={ selectedFile }
					/>
					<FormFieldset>
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

					<FormFieldset>
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
			showJetpackPowered
		/>
	);
};

export default LinkInBioSetup;
