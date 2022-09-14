/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { FormEvent, useEffect, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import SetupForm from '../link-in-bio-setup/setup-form';
import type { Step } from '../../types';

import '../link-in-bio-setup/styles.scss';

const LinkInBioPostSetup: Step = function LinkInBioPostSetup( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const site = useSite();

	const [ siteTitle, setComponentSiteTitle ] = useState( '' );
	const [ tagline, setTagline ] = useState( '' );
	const [ invalidSiteTitle, setInvalidSiteTitle ] = useState( false );
	const [ selectedFile, setSelectedFile ] = useState< File | undefined >();
	const [ base64Image, setBase64Image ] = useState< string | null >();

	const { saveSiteSettings } = useDispatch( SITE_STORE );

	useEffect( () => {
		setComponentSiteTitle( site?.name || '' );
		setTagline( site?.description || '' );
	}, [ site ] );

	const handleSubmit = async ( event: FormEvent ) => {
		event.preventDefault();
		setInvalidSiteTitle( ! siteTitle.trim().length );

		if ( site ) {
			await saveSiteSettings( site.ID, {
				blogname: siteTitle,
				blogdescription: tagline,
			} );
		}

		// Still need to handle updating site icon here
		if ( selectedFile && base64Image ) {
			try {
				// update site icon here
			} catch ( _error ) {
				// or communicate the error to the user
			}
		}

		if ( siteTitle.trim().length ) {
			submit?.();
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
				/>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default LinkInBioPostSetup;
