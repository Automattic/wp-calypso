import { Onboard } from '@automattic/data-stores';
import { StepContainer, base64ImageToBlob } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { FormEvent, useEffect, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import SetupForm from '../components/setup-form';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import './style.scss';

const NewsletterSetup: Step< {
	submits: {
		siteTitle: string;
		tagline: string;
		paidSubscribers: boolean;
	};
} > = ( { navigation } ) => {
	const { submit } = navigation;
	const translate = useTranslate();
	const site = useSite();

	const newsletterFormText = {
		titleLabel: translate( 'Give your newsletter a name' ),
		titlePlaceholder: translate( 'Open Me Carefully' ),
		titleMissing: translate( "Oops. Looks like your newsletter doesn't have a name yet." ),
		taglineLabel: translate( 'Add a brief description' ),
		taglinePlaceholder: translate( "Letters from Emily Dickinson's garden" ),
		iconPlaceholder: translate( 'Add a site icon' ),
	};

	const { setSiteTitle, setSiteDescription, setSiteLogo, setGoals, resetGoals } =
		useDispatch( ONBOARD_STORE );

	const [ invalidSiteTitle, setInvalidSiteTitle ] = useState( false );
	const [ paidSubscribers, setPaidSubscribers ] = useState( false );
	const [ siteTitle, setComponentSiteTitle ] = useState( '' );
	const [ tagline, setTagline ] = useState( '' );
	const [ base64Image, setBase64Image ] = useState< string | null >();
	const [ selectedFile, setSelectedFile ] = useState< File | undefined >();
	const state = useSelect( ( select ) => select( ONBOARD_STORE ) as OnboardSelect, [] ).getState();

	useEffect( () => {
		const { siteTitle, siteDescription, siteLogo, paidSubscribers } = state;

		setTagline( siteDescription );
		setComponentSiteTitle( siteTitle );
		setPaidSubscribers( paidSubscribers );
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
		setPaidSubscribers( paidSubscribers );

		if ( paidSubscribers ) {
			setGoals( [ Onboard.SiteGoal.PaidSubscribers ] );
		} else {
			// Clears goals entirely each time, regardless if they were set previously or not.
			// We could instead just handle removing PaidSubscribers goal, and avoid doing anything if nothing wasn't set ever.
			resetGoals();
		}

		if ( selectedFile && base64Image ) {
			try {
				setSiteLogo( base64Image );
			} catch ( _error ) {
				// communicate the error to the user
			}
		}

		if ( siteTitle.trim().length ) {
			submit?.( { siteTitle, tagline, paidSubscribers } );
		}
	};

	return (
		<StepContainer
			goBack={ navigation.goBack }
			stepName="newsletter-setup"
			isWideLayout
			flowName="newsletter"
			formattedHeader={
				<FormattedHeader
					id="newsletter-setup-header"
					headerText={ translate( 'It begins with a name.' ) }
					subHeaderText={ translate( 'A catchy name and description can set a newsletter apart.' ) }
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
					className="newsletter-setup-form"
				/>
			}
			recordTracksEvent={ recordTracksEvent }
			showJetpackPowered
		/>
	);
};

export default NewsletterSetup;
