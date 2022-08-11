/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button, FormInputValidation } from '@automattic/components';
// import { useSiteLogoMutation } from '@automattic/data-stores';
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
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import type { Step } from '../../types';

import './styles.scss';

const LinkInBioSetup: Step = function LinkInBioSetup( { navigation } ) {
	const { goBack } = navigation;
	const { __ } = useI18n();
	const site = useSite();

	const [ formTouched, setFormTouched ] = React.useState( false );
	const [ selectedFile, setSelectedFile ] = React.useState< File | undefined >();
	const [ base64Image, setBase64Image ] = React.useState< string | null >();
	const [ siteTitle, setComponentSiteTitle ] = React.useState( '' );
	const [ tagline, setTagline ] = React.useState( '' );
	const { setSiteTitle, setSiteDescription, setSiteLogo } = useDispatch( ONBOARD_STORE );

	// move to loader step
	// const { mutateAsync: setSiteLogo } = useSiteLogoMutation( site?.ID );
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
		if ( site ) {
			setFormTouched( true );
			switch ( event.currentTarget.name ) {
				case 'link-in-bio-input-name':
					return setComponentSiteTitle( event.currentTarget.value );
				case 'link-in-bio-input-description':
					return setTagline( event.currentTarget.value );
			}
		}
	};

	const imageFileToBase64 = ( file: Blob ) => {
		const reader = new FileReader();
		reader.readAsDataURL( file );
		reader.onload = () => setBase64Image( reader.result as string );
		reader.onerror = () => setBase64Image( null );
	};

	// This has to be used to get the image from the store, probably on the loader step
	// const base64ImageToBlob = ( base64String: string ) => {
	// 	// extract content type and base64 payload from original string
	// 	const pos = base64String.indexOf( ';base64,' );
	// 	const type = base64String.substring( 5, pos );
	// 	const b64 = base64String.substr( pos + 8 );

	// 	// decode base64
	// 	const imageContent = atob( b64 );

	// 	// create an ArrayBuffer and a view (as unsigned 8-bit)
	// 	const buffer = new ArrayBuffer( imageContent.length );
	// 	const view = new Uint8Array( buffer );

	// 	// fill the view, using the decoded base64
	// 	for ( let n = 0; n < imageContent.length; n++ ) {
	// 		view[ n ] = imageContent.charCodeAt( n );
	// 	}

	// 	// convert ArrayBuffer to Blob
	// 	const blob = new Blob( [ buffer ], { type: type } );

	// 	return blob;
	// };

	const handleSubmit = async ( event: FormEvent ) => {
		event.preventDefault();
		if ( site ) {
			setSiteDescription( tagline );
			setSiteTitle( siteTitle );

			if ( selectedFile && base64Image ) {
				try {
					setSiteLogo( base64Image );

					// this should be moved to the loader step
					// await setSiteLogo( new File( [ base64ImageToBlob( base64Image ) ], 'site-logo.png' ) );
				} catch ( _error ) {
					// communicate the error to the user
				}
			}
			// submit?.( { siteTitle, tagline } );
		}
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
