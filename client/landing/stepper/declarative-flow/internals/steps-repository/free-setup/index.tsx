import { StepContainer, base64ImageToBlob } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import React, { FormEvent, useEffect } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { clearSignupDestinationCookie } from 'calypso/signup/storageUtils';
import { useSite } from '../../../../hooks/use-site';
import SetupForm from '../components/setup-form';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

import './styles.scss';

const FreeSetup: Step = function FreeSetup( { navigation } ) {
	const { submit } = navigation;
	const translate = useTranslate();
	const site = useSite();

	const formText = {
		titlePlaceholder: translate( 'My Website' ),
		titleMissing: translate( `Oops. Looks like your website doesn't have a name yet.` ),
		taglinePlaceholder: translate( 'Describe your website in a line or two' ),
		iconPlaceholder: translate( 'Add a site icon' ),
	};

	const [ invalidSiteTitle, setInvalidSiteTitle ] = React.useState( false );
	const [ selectedFile, setSelectedFile ] = React.useState< File | undefined >();
	const [ base64Image, setBase64Image ] = React.useState< string | null >();
	const [ siteTitle, setComponentSiteTitle ] = React.useState( '' );
	const [ tagline, setTagline ] = React.useState( '' );
	const { setSiteTitle, setSiteDescription, setSiteLogo } = useDispatch( ONBOARD_STORE );
	const state = useSelect( ( select ) => select( ONBOARD_STORE ) as OnboardSelect, [] ).getState();

	useEffect( () => {
		clearSignupDestinationCookie();
	}, [] );

	useEffect( () => {
		const { siteTitle, siteDescription, siteLogo } = state;

		setTagline( siteDescription );
		setComponentSiteTitle( siteTitle );

		if ( siteLogo ) {
			const file = new File( [ base64ImageToBlob( siteLogo ) ], 'site-logo.png' );
			setSelectedFile( file );
		}
		// These are the actual dependencies, not the state object.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ state.siteTitle, state.siteDescription, state.siteLogo ] );

	const handleSubmit = async ( event: FormEvent ) => {
		event.preventDefault();

		if ( ! siteTitle.trim().length ) {
			setInvalidSiteTitle( true );
			return;
		}

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
			submit?.();
		}
	};

	return (
		<StepContainer
			stepName="free-setup"
			isWideLayout
			hideBack
			flowName="free"
			formattedHeader={
				<FormattedHeader
					id="free-setup-header"
					headerText={ createInterpolateElement( translate( 'Personalize your Site' ), {
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
			showJetpackPowered
		/>
	);
};

export default FreeSetup;
