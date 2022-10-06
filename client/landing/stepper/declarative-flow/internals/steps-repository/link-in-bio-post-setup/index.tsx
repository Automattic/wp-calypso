/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer, base64ImageToBlob, uploadAndSetSiteLogo } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { FormEvent, useEffect, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import SetupForm from '../components/setup-form';
import type { Step } from '../../types';

import '../link-in-bio-setup/styles.scss';

const LinkInBioPostSetup: Step = function LinkInBioPostSetup( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const site = useSite();

	const linkInBioFormText = {
		titlePlaceholder: __( 'My Link in Bio' ),
		titleMissing: __( `Oops. Looks like your Link in Bio name is missing.` ),
		taglinePlaceholder: __( 'Add a short biography here' ),
	};

	const [ siteTitle, setComponentSiteTitle ] = useState( '' );
	const [ tagline, setTagline ] = useState( '' );
	const [ invalidSiteTitle, setInvalidSiteTitle ] = useState( false );
	const [ selectedFile, setSelectedFile ] = useState< File | undefined >();
	const [ base64Image, setBase64Image ] = useState< string | null >();
	const [ isLoading, setIsLoading ] = useState< boolean >( false );
	const [ isSubmitError, setIsSubmitError ] = useState< boolean >( false );

	const { saveSiteSettings } = useDispatch( SITE_STORE );

	useEffect( () => {
		setComponentSiteTitle( site?.name || '' );
		setTagline( site?.description || '' );
	}, [ site ] );

	useEffect( () => {
		setIsSubmitError( false );
	}, [ siteTitle, tagline, selectedFile, base64Image ] );

	const handleSubmit = async ( event: FormEvent ) => {
		event.preventDefault();

		if ( ! siteTitle.trim().length ) {
			setInvalidSiteTitle( true );
			return;
		}

		try {
			if ( site ) {
				setIsLoading( true );
				await saveSiteSettings( site.ID, {
					blogname: siteTitle,
					blogdescription: tagline,
				} );
				if ( base64Image ) {
					await uploadAndSetSiteLogo(
						site.ID,
						new File( [ base64ImageToBlob( base64Image ) ], 'site-logo.png' )
					);
				}
				setIsLoading( false );
				submit?.();
			}
		} catch {
			setIsSubmitError( true );
			setIsLoading( false );
		}
	};

	return (
		<StepContainer
			stepName={ 'link-in-bio-setup' }
			isWideLayout={ true }
			hideBack={ true }
			flowName={ 'linkInBioPostSetup' }
			formattedHeader={
				<FormattedHeader
					id={ 'link-in-bio-setup-header' }
					headerText={ createInterpolateElement( __( 'Personalize your<br />Link in Bio' ), {
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
					setTagline={ setTagline }
					selectedFile={ selectedFile }
					setSelectedFile={ setSelectedFile }
					setBase64Image={ setBase64Image }
					handleSubmit={ handleSubmit }
					translatedText={ linkInBioFormText }
					isLoading={ isLoading }
					isSubmitError={ isSubmitError }
				/>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default LinkInBioPostSetup;
