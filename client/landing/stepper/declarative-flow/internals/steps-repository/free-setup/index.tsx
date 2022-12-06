import { StepContainer, base64ImageToBlob } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import React, { FormEvent, useEffect } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import SetupForm from '../components/setup-form';
import type { Step } from '../../types';

import './styles.scss';

const FreeSetup: Step = function FreeSetup( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const site = useSite();

	const formText = {
		titlePlaceholder: __( 'My Website' ),
		titleMissing: __( `Oops. Looks like your website doesn't have a name yet.` ),
		taglinePlaceholder: __( 'Add a short description here' ),
		iconPlaceholder: __( 'Upload a profile image' ),
	};

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

	return (
		<StepContainer
			stepName="free-setup"
			isWideLayout={ true }
			hideBack={ true }
			flowName="free"
			formattedHeader={
				<FormattedHeader
					id="free-setup-header"
					headerText={ createInterpolateElement( __( 'Personalize your<br />Website' ), {
						br: <br />,
					} ) }
					align="center"
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
					setTagline={ setTagline }
					selectedFile={ selectedFile }
					setSelectedFile={ setSelectedFile }
					setBase64Image={ setBase64Image }
					handleSubmit={ handleSubmit }
					translatedText={ formText }
				/>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default FreeSetup;
