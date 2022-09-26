import { hexToRgb, StepContainer, base64ImageToBlob } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import React, { FormEvent, useEffect } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import SetupForm from '../shared-components/setup-form';
import { AccentColor } from '../shared-components/setup-form/accent-color-control';
import type { Step } from '../../types';
import './style.scss';

const defaultAccentColor = {
	hex: '#1D39EB',
	rgb: { r: 29, g: 57, b: 235 },
	default: true,
};

const NewsletterSetup: Step = ( { navigation } ) => {
	const { submit } = navigation;
	const { __ } = useI18n();
	const site = useSite();

	const { setSiteTitle, setSiteAccentColor, setSiteDescription, setSiteLogo } =
		useDispatch( ONBOARD_STORE );

	const [ invalidSiteTitle, setInvalidSiteTitle ] = React.useState( false );
	const [ siteTitle, setComponentSiteTitle ] = React.useState( '' );
	const [ tagline, setTagline ] = React.useState( '' );
	const [ accentColor, setAccentColor ] = React.useState< AccentColor >( defaultAccentColor );
	const [ base64Image, setBase64Image ] = React.useState< string | null >();
	const [ selectedFile, setSelectedFile ] = React.useState< File | undefined >();
	const state = useSelect( ( select ) => select( ONBOARD_STORE ) ).getState();

	useEffect( () => {
		const { siteAccentColor, siteTitle, siteDescription, siteLogo } = state;
		if ( siteAccentColor && siteAccentColor !== '' && siteAccentColor !== defaultAccentColor.hex ) {
			setAccentColor( { hex: siteAccentColor, rgb: hexToRgb( siteAccentColor ) } );
		} else {
			setAccentColor( defaultAccentColor );
		}

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

	const handleSubmit = async ( event: FormEvent ) => {
		event.preventDefault();
		setInvalidSiteTitle( ! siteTitle.trim().length );

		setSiteDescription( tagline );
		setSiteTitle( siteTitle );
		setSiteAccentColor( accentColor.hex );

		if ( selectedFile && base64Image ) {
			try {
				setSiteLogo( base64Image );
			} catch ( _error ) {
				// communicate the error to the user
			}
		}

		if ( siteTitle.trim().length ) {
			submit?.( { siteTitle, tagline, siteAccentColor: accentColor.hex } );
		}
	};

	return (
		<StepContainer
			stepName={ 'newsletter-setup' }
			isWideLayout={ true }
			hideBack={ true }
			flowName={ 'newsletter' }
			formattedHeader={
				<FormattedHeader
					id={ 'newsletter-setup-header' }
					headerText={ createInterpolateElement( __( 'Personalize your<br />Newsletter' ), {
						br: <br />,
					} ) }
					align={ 'center' }
				/>
			}
			stepContent={
				<SetupForm
					site={ site }
					siteTitle={ siteTitle }
					setComponentSiteTitle={ setComponentSiteTitle }
					invalidSiteTitle={ invalidSiteTitle }
					setInvalidSiteTitle={ setInvalidSiteTitle }
					tagline={ tagline }
					accentColor={ accentColor }
					setAccentColor={ setAccentColor }
					setTagline={ setTagline }
					selectedFile={ selectedFile }
					setSelectedFile={ setSelectedFile }
					setBase64Image={ setBase64Image }
					handleSubmit={ handleSubmit }
				/>
			}
			recordTracksEvent={ recordTracksEvent }
			showJetpackPowered
		/>
	);
};

export default NewsletterSetup;
