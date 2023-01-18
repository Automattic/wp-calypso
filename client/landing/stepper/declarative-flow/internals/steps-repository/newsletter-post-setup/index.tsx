import {
	StepContainer,
	base64ImageToBlob,
	uploadAndSetSiteLogo,
	hexToRgb,
} from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { FormEvent, useEffect, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import useAccentColor from 'calypso/landing/stepper/hooks/use-accent-color';
import useSaveAccentColor from 'calypso/landing/stepper/hooks/use-save-accent-color';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import AccentColorControl, { AccentColor } from '../components/accent-color-control';
import SetupForm from '../components/setup-form';
import useSetupFormInitialValues from '../components/setup-form/hooks/use-setup-form-initial-values';
import { defaultAccentColor } from '../newsletter-setup';
import type { Step } from '../../types';

import '../newsletter-setup/style.scss';

const NewsletterPostSetup: Step = ( { navigation } ) => {
	const { submit } = navigation;
	const translate = useTranslate();
	const site = useSite();
	const fetchedAccentColor = useAccentColor();
	const saveAccentColor = useSaveAccentColor();
	const newsletterFormText = {
		titlePlaceholder: translate( 'My newsletter' ),
		titleMissing: translate( `Oops. Looks like your Newsletter doesn't have a name yet.` ),
		taglinePlaceholder: translate( 'Describe your Newsletter in a line or two' ),
		iconPlaceholder: translate( 'Add a site icon' ),
	};

	const [ invalidSiteTitle, setInvalidSiteTitle ] = useState( false );
	const [ accentColor, setAccentColor ] = useState< AccentColor >( defaultAccentColor );
	const [ base64Image, setBase64Image ] = useState< string | null >();
	const [ selectedFile, setSelectedFile ] = useState< File | undefined >();
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isSubmitError, setIsSubmitError ] = useState( false );
	const { saveSiteSettings } = useDispatch( SITE_STORE );

	const { siteTitle, setComponentSiteTitle, tagline, setTagline } = useSetupFormInitialValues();

	useEffect( () => {
		if ( fetchedAccentColor ) {
			setAccentColor( {
				hex: fetchedAccentColor,
				rgb: hexToRgb( fetchedAccentColor ),
				default: false,
			} );
		}
	}, [ fetchedAccentColor ] );

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
				if ( accentColor.hex !== fetchedAccentColor ) {
					await saveAccentColor( site.ID, accentColor.hex );
				}
				if ( base64Image ) {
					await uploadAndSetSiteLogo(
						site.ID,
						new File( [ base64ImageToBlob( base64Image ) ], 'site-logo.png' )
					);
				}
				setIsLoading( false );
				submit?.( { color: accentColor.hex.replace( '#', '' ) } );
			}
		} catch {
			setIsSubmitError( true );
			setIsLoading( false );
		}
	};

	return (
		<StepContainer
			stepName="newsletter-setup"
			isWideLayout={ true }
			hideBack={ true }
			flowName="newsletter"
			formattedHeader={
				<FormattedHeader
					id="newsletter-setup-header"
					headerText={ createInterpolateElement( translate( 'Personalize your<br />Newsletter' ), {
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
				>
					<AccentColorControl accentColor={ accentColor } setAccentColor={ setAccentColor } />
				</SetupForm>
			}
			recordTracksEvent={ recordTracksEvent }
			showJetpackPowered
		/>
	);
};

export default NewsletterPostSetup;
