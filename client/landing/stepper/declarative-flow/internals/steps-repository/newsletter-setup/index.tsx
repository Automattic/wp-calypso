import { useLocale } from '@automattic/i18n-utils';
import { hexToRgb, StepContainer, base64ImageToBlob } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import { FormEvent, useEffect, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import AccentColorControl, { AccentColor } from '../components/accent-color-control';
import SetupForm from '../components/setup-form';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import './style.scss';

export const defaultAccentColor = {
	hex: '#113AF5',
	rgb: { r: 17, g: 58, b: 245 },
	default: true,
};

const NewsletterSetup: Step = ( { navigation } ) => {
	const { submit } = navigation;
	const translate = useTranslate();
	const { hasTranslation } = useI18n();
	const locale = useLocale();
	const site = useSite();

	const newsletterFormText = {
		titleLabel:
			locale === 'en' || hasTranslation?.( 'Give your blog a name' )
				? translate( 'Give your blog a name' )
				: '',
		titlePlaceholder:
			locale === 'en' || hasTranslation?.( 'Open Me Carefully' )
				? translate( 'Open Me Carefully' )
				: translate( 'My newsletter' ),
		titleMissing: translate( `Oops. Looks like your Newsletter doesn't have a name yet.` ),
		taglineLabel:
			locale === 'en' || hasTranslation?.( 'Add a brief description' )
				? translate( 'Add a brief description' )
				: '',
		taglinePlaceholder:
			locale === 'en' || hasTranslation?.( `Letters from Emily Dickinson's garden` )
				? translate( `Letters from Emily Dickinson's garden` )
				: translate( 'Describe your Newsletter in a line or two' ),
		iconPlaceholder: translate( 'Add a site icon' ),
		colorLabel:
			locale === 'en' || hasTranslation?.( 'Favorite color' )
				? translate( 'Favorite color' )
				: translate( 'Brand color' ),
		buttonText:
			locale === 'en' || hasTranslation?.( 'Save and continue' )
				? translate( 'Save and continue' )
				: translate( 'Continue' ),
	};

	const { setSiteTitle, setSiteAccentColor, setSiteDescription, setSiteLogo } =
		useDispatch( ONBOARD_STORE );

	const [ invalidSiteTitle, setInvalidSiteTitle ] = useState( false );
	const [ siteTitle, setComponentSiteTitle ] = useState( '' );
	const [ tagline, setTagline ] = useState( '' );
	const [ accentColor, setAccentColor ] = useState< AccentColor >( defaultAccentColor );
	const [ base64Image, setBase64Image ] = useState< string | null >();
	const [ selectedFile, setSelectedFile ] = useState< File | undefined >();
	const state = useSelect( ( select ) => select( ONBOARD_STORE ) as OnboardSelect, [] ).getState();

	useEffect( () => {
		const { siteAccentColor, siteTitle, siteDescription, siteLogo } = state;
		if ( siteAccentColor && siteAccentColor !== '' && siteAccentColor !== defaultAccentColor.hex ) {
			setAccentColor( { hex: siteAccentColor, rgb: hexToRgb( siteAccentColor ) } );
		} else {
			setAccentColor( defaultAccentColor );
		}

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
		setSiteAccentColor( accentColor.hex );

		if ( selectedFile && base64Image ) {
			try {
				setSiteLogo( base64Image );
			} catch ( _error ) {
				// communicate the error to the user
			}
		}

		if ( siteTitle.trim().length ) {
			submit?.( { siteTitle, tagline, siteAccentColor: accentColor.hex } );
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
					headerText={
						hasTranslation( 'Make it yours.' ) || locale === 'en'
							? translate( 'Make it yours.' )
							: createInterpolateElement( translate( 'Personalize your<br />Newsletter' ), {
									br: <br />,
							  } )
					}
					subHeaderText={
						( hasTranslation(
							'Personalize your newsletter with a name, description, and accent color that sets it apart.'
						) ||
							locale === 'en' ) &&
						translate(
							'Personalize your newsletter with a name, description, and accent color that sets it apart.'
						)
					}
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
				>
					<AccentColorControl
						accentColor={ accentColor }
						setAccentColor={ setAccentColor }
						labelText={ newsletterFormText?.colorLabel }
					/>
				</SetupForm>
			}
			recordTracksEvent={ recordTracksEvent }
			showJetpackPowered
		/>
	);
};

export default NewsletterSetup;
