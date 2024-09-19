import { StepContainer, base64ImageToBlob, uploadAndSetSiteLogo } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { FormEvent, useEffect, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import SetupForm from '../components/setup-form';
import useSetupFormInitialValues from '../components/setup-form/hooks/use-setup-form-initial-values';
import type { Step } from '../../types';

import '../newsletter-setup/style.scss';

const NewsletterPostSetup: Step = ( { navigation } ) => {
	const { submit } = navigation;
	const translate = useTranslate();
	const site = useSite();
	const newsletterFormText = {
		titleLabel: translate( 'Give your newsletter a name' ),
		titlePlaceholder: translate( 'Open Me Carefully' ),
		titleMissing: translate( `Oops. Looks like your newsletter doesn't have a name yet.` ),
		taglineLabel: translate( 'Add a brief description' ),
		taglinePlaceholder: translate( `Letters from Emily Dickinson's garden` ),
		iconPlaceholder: translate( 'Add a site icon' ),
	};

	const [ invalidSiteTitle, setInvalidSiteTitle ] = useState( false );
	const [ base64Image, setBase64Image ] = useState< string | null >();
	const [ selectedFile, setSelectedFile ] = useState< File | undefined >();
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isSubmitError, setIsSubmitError ] = useState( false );
	const { saveSiteSettings } = useDispatch( SITE_STORE );

	const { siteTitle, setComponentSiteTitle, tagline, setTagline } = useSetupFormInitialValues();

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
			stepName="newsletter-setup"
			isWideLayout
			hideBack
			flowName="newsletter"
			formattedHeader={
				<FormattedHeader
					id="newsletter-setup-header"
					headerText={ createInterpolateElement( translate( 'Personalize your<br />newsletter' ), {
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
					translatedText={ newsletterFormText }
					isLoading={ isLoading }
					isSubmitError={ isSubmitError }
					className="newsletter-setup-form"
				/>
			}
			recordTracksEvent={ recordTracksEvent }
			showJetpackPowered
		/>
	);
};

export default NewsletterPostSetup;
