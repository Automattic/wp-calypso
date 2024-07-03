import { StepContainer } from '@automattic/onboarding';
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
import './styles.scss';

const SetupBlog: Step = ( { navigation, flow } ) => {
	const { submit } = navigation;
	const translate = useTranslate();
	const site = useSite();

	const formText = {
		titleLabel: translate( 'Give your blog a name' ),
		titlePlaceholder: translate( 'A catchy name to make your blog memorable' ),
		titleMissing: translate( `A catchy name to make your blog memorable` ),
		taglineLabel: translate( 'Add a brief description' ),
		taglinePlaceholder: translate( "Let people know what your blog's about" ),
		buttonText: translate( 'Save and continue' ),
	};

	const [ invalidSiteTitle, setInvalidSiteTitle ] = useState( false );
	const [ base64Image, setBase64Image ] = useState< string | null >();
	const [ selectedFile, setSelectedFile ] = useState< File | undefined >();
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isSubmitError, setIsSubmitError ] = useState( false );
	const { saveSiteSettings } = useDispatch( SITE_STORE );

	const { siteTitle, setComponentSiteTitle, tagline, setTagline } = useSetupFormInitialValues();

	useEffect( () => {
		if ( siteTitle === 'Site Title' ) {
			setComponentSiteTitle( '' );
		}
	}, [ flow, setComponentSiteTitle, siteTitle ] );

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
				submit?.();
			}
		} catch {
			setIsSubmitError( true );
			setIsLoading( false );
		}
	};

	if ( ! site ) {
		return null;
	}

	return (
		<StepContainer
			stepName="setup-blog"
			isWideLayout
			hideBack
			flowName="free"
			formattedHeader={
				<FormattedHeader
					id="setup-blog-header"
					headerText={ createInterpolateElement( translate( 'Make it yours.' ), {
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
					isLoading={ isLoading }
					isSubmitError={ isSubmitError }
				/>
			}
			recordTracksEvent={ recordTracksEvent }
			showJetpackPowered
		/>
	);
};

export default SetupBlog;
