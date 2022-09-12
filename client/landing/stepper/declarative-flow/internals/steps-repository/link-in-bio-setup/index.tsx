/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button, FormInputValidation } from '@automattic/components';
import { StepContainer, base64ImageToBlob } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import React, { FormEvent, useEffect } from 'react';
import greenCheckmarkImg from 'calypso/assets/images/onboarding/green-checkmark.svg';
import { ForwardedAutoresizingFormTextarea } from 'calypso/blocks/comments/autoresizing-form-textarea';
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
	const { submit } = navigation;
	const { __ } = useI18n();
	const site = useSite();

	const usesSite = !! useSiteSlugParam();
	const [ invalidSiteTitle, setInvalidSiteTitle ] = React.useState( false );
	const [ selectedFile, setSelectedFile ] = React.useState< File | undefined >();
	const [ base64Image, setBase64Image ] = React.useState< string | null >();
	const [ siteTitle, setComponentSiteTitle ] = React.useState( '' );
	const [ tagline, setTagline ] = React.useState( '' );
	const { setSiteTitle, setSiteDescription, setSiteLogo } = useDispatch( ONBOARD_STORE );
	const state = useSelect( ( select ) => select( ONBOARD_STORE ) ).getState();

	useEffect( () => {
		const { siteTitle, siteDescription, siteLogo } = state;
		setTagline( siteDescription );
		setComponentSiteTitle( siteTitle );

		if ( siteLogo ) {
			const file = new File( [ base64ImageToBlob( siteLogo ) ], 'site-logo.png' );
			setSelectedFile( file );
		}
	}, [ state ] );

	useEffect( () => {
		if ( ! site ) {
			return;
		}

		setComponentSiteTitle( site.name || '' );
		setTagline( site.description );
	}, [ site ] );

	useEffect( () => {
		if ( siteTitle.trim().length && invalidSiteTitle ) {
			setInvalidSiteTitle( false );
		}
	}, [ siteTitle, invalidSiteTitle ] );

	const onChange = ( event: React.FormEvent< HTMLInputElement > ) => {
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
		setInvalidSiteTitle( ! siteTitle.trim().length );

		setSiteDescription( tagline );
		setSiteTitle( siteTitle );

		if ( selectedFile && base64Image ) {
			try {
				setSiteLogo( base64Image );
			} catch ( _error ) {
				// communicate the error to the user
			}
		}

		if ( siteTitle.trim().length ) {
			submit?.( { siteTitle, tagline } );
		}
	};

	const stepContent = (
		<form className="link-in-bio-setup__form" onSubmit={ handleSubmit }>
			<SiteIconWithPicker
				site={ site }
				placeholderText={ __( 'Upload a profile image' ) }
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
					placeholder={ __( 'My Link in Bio' ) }
					style={ {
						backgroundImage: siteTitle.trim() ? `url(${ greenCheckmarkImg })` : 'unset',
						backgroundRepeat: 'no-repeat',
						backgroundPosition: '95%',
						paddingRight: ' 40px',
					} }
					isError={ invalidSiteTitle }
				/>
				{ invalidSiteTitle && (
					<FormInputValidation
						isError
						text={ __( `Oops. Looks like your Link in Bio doesn't have a name yet.` ) }
					/>
				) }
			</FormFieldset>

			<FormFieldset>
				<FormLabel htmlFor="link-in-bio-input-description">{ __( 'Brief description' ) }</FormLabel>
				<ForwardedAutoresizingFormTextarea
					name="link-in-bio-input-description"
					id="link-in-bio-input-description"
					value={ tagline }
					placeholder={ __( 'Add a short biography here' ) }
					enableAutoFocus={ false }
					onChange={ onChange }
					style={ {
						backgroundImage: tagline.trim() ? `url(${ greenCheckmarkImg })` : 'unset',
						backgroundRepeat: 'no-repeat',
						backgroundPosition: '95%',
						paddingRight: ' 40px',
						paddingLeft: '14px',
					} }
				/>
			</FormFieldset>

			<Button className="link-in-bio-setup-form__submit" primary type="submit">
				{ __( 'Continue' ) }
			</Button>
		</form>
	);

	return (
		<StepContainer
			stepName={ 'link-in-bio-setup' }
			isWideLayout={ true }
			hideBack={ true }
			flowName={ 'linkInBio' }
			formattedHeader={
				<FormattedHeader
					id={ 'link-in-bio-setup-header' }
					headerText={ createInterpolateElement( __( 'Personalize your<br />Link in Bio' ), {
						br: <br />,
					} ) }
					align={ 'center' }
				/>
			}
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default LinkInBioSetup;
