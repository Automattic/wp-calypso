import { StepContainer, base64ImageToBlob } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { FormEvent, useEffect, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import SetupForm from '../components/setup-form';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import './style.scss';

const PodcastSetup: Step = ( { navigation } ) => {
	const { submit } = navigation;
	const { __ } = useI18n();
	const site = useSite();

	const { setSiteTitle, setSiteDescription, setSiteLogo } = useDispatch( ONBOARD_STORE );

	const [ invalidSiteTitle, setInvalidSiteTitle ] = useState( false );
	const [ siteTitle, setComponentSiteTitle ] = useState( '' );
	const [ tagline, setTagline ] = useState( '' );
	const [ base64Image, setBase64Image ] = useState< string | null >();
	const [ selectedFile, setSelectedFile ] = useState< File | undefined >();
	const state = useSelect( ( select ) => select( ONBOARD_STORE ) as OnboardSelect, [] ).getState();

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

	const handleSubmit = ( event: FormEvent ) => {
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
			stepName="podcast-setup"
			isWideLayout={ true }
			hideBack={ true }
			flowName="podcast"
			formattedHeader={
				<FormattedHeader
					id="podcast-setup-header"
					headerText={ __( 'It begins with a name' ) }
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
					siteIconIsCircle={ false }
					translatedText={ {
						titleLabel: __( 'Give your podcast a name' ),
						titlePlaceholder: __( 'My podcast' ),
						titleMissing: __( `Oops. Looks like your podcast doesn't have a name yet.` ),
						taglineLabel: __( 'Add a brief description' ),
						taglinePlaceholder: __( `The next big thing.` ),
						iconPlaceholder: __( 'Add a podcast cover' ),
					} }
					className="podcast-setup-form"
				/>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default PodcastSetup;
