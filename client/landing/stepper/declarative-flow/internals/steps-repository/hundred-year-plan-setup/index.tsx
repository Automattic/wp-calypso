import { base64ImageToBlob } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import React, { FormEvent, useEffect } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { useSite } from '../../../../hooks/use-site';
import SetupForm from '../components/setup-form';
import HundredYearPlanStepWrapper from '../hundred-year-plan-step-wrapper';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

import './styles.scss';

const HundredYearPlanSetup: Step = function HundredYearPlanSetup( { navigation, flow } ) {
	const { submit } = navigation;
	const translate = useTranslate();
	const site = useSite();

	const HundredYearPlanFormText = {
		titlePlaceholder: translate( 'Site name' ),
		titleMissing: translate( `Please enter a site name.` ),
		taglinePlaceholder: translate( 'Add a brief description' ),
		iconPlaceholder: translate( 'Add an icon' ),
	};

	const [ invalidSiteTitle, setInvalidSiteTitle ] = React.useState( false );
	const [ selectedFile, setSelectedFile ] = React.useState< File | undefined >();
	const [ base64Image, setBase64Image ] = React.useState< string | null >();
	const [ siteTitle, setComponentSiteTitle ] = React.useState( '' );
	const [ tagline, setTagline ] = React.useState( '' );
	const { setSiteTitle, setSiteDescription, setSiteLogo } = useDispatch( ONBOARD_STORE );
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
		<HundredYearPlanStepWrapper
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
					translatedText={ HundredYearPlanFormText }
				/>
			}
			formattedHeader={
				<FormattedHeader
					brandFont
					headerText={ translate( 'Every legacy begins with a name' ) }
					subHeaderText={ translate(
						'Give your site a fitting name and description — you can always change it later.'
					) }
				/>
			}
			stepName="hundred-year-plan-setup"
			flowName={ flow }
		/>
	);
};

export default HundredYearPlanSetup;
