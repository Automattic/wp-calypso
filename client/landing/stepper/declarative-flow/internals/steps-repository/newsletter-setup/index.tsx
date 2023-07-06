import { Onboard } from '@automattic/data-stores';
import { hexToRgb, StepContainer, base64ImageToBlob } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import InfoPopover from 'calypso/components/info-popover';
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
	const site = useSite();

	const newsletterFormText = {
		titleLabel: translate( 'Give your newsletter a name' ),
		titlePlaceholder: translate( 'Open Me Carefully' ),
		titleMissing: translate( `Oops. Looks like your newsletter doesn't have a name yet.` ),
		taglineLabel: translate( 'Add a brief description' ),
		taglinePlaceholder: translate( `Letters from Emily Dickinson's garden` ),
		iconPlaceholder: translate( 'Add a site icon' ),
		colorLabel: translate( 'Choose an accent color' ),
	};

	const {
		setSiteTitle,
		setSiteAccentColor,
		setSiteDescription,
		setSiteLogo,
		setGoals,
		resetGoals,
	} = useDispatch( ONBOARD_STORE );

	const [ invalidSiteTitle, setInvalidSiteTitle ] = useState( false );
	const [ paidSubscribers, setPaidSubscribers ] = useState( false );
	const [ siteTitle, setComponentSiteTitle ] = useState( '' );
	const [ tagline, setTagline ] = useState( '' );
	const [ accentColor, setAccentColor ] = useState< AccentColor >( defaultAccentColor );
	const [ base64Image, setBase64Image ] = useState< string | null >();
	const [ selectedFile, setSelectedFile ] = useState< File | undefined >();
	const state = useSelect( ( select ) => select( ONBOARD_STORE ) as OnboardSelect, [] ).getState();

	useEffect( () => {
		const { siteAccentColor, siteTitle, siteDescription, siteLogo, paidSubscribers } = state;
		if ( siteAccentColor && siteAccentColor !== '' && siteAccentColor !== defaultAccentColor.hex ) {
			setAccentColor( { hex: siteAccentColor, rgb: hexToRgb( siteAccentColor ) } );
		} else {
			setAccentColor( defaultAccentColor );
		}

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
		setSiteAccentColor( accentColor.hex );
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
			submit?.( { siteTitle, tagline, siteAccentColor: accentColor.hex, paidSubscribers } );
		}
	};

	const onPaidSubscribersChanged = ( event: ChangeEvent< HTMLInputElement > ) => {
		setPaidSubscribers( !! event?.target.checked );
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
					headerText={ translate( 'It begins with a name.' ) }
					subHeaderText={ translate(
						'A catchy name, description, and accent color can set a newsletter apart.'
					) }
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
					<>
						<AccentColorControl
							accentColor={ accentColor }
							setAccentColor={ setAccentColor }
							labelText={ newsletterFormText?.colorLabel }
						/>
						<FormFieldset className="newsletter-setup__paid-subscribers">
							<FormLabel>
								<FormInputCheckbox
									name="paid_newsletters"
									checked={ paidSubscribers }
									onChange={ onPaidSubscribersChanged }
								/>
								<span>{ translate( 'I want to start a paid newsletter' ) }</span>
							</FormLabel>
							<InfoPopover position="bottom right">
								{ translate(
									'Let your audience support your work. Add paid subscriptions and gated content to your newsletter.'
								) }
							</InfoPopover>
						</FormFieldset>
					</>
				</SetupForm>
			}
			recordTracksEvent={ recordTracksEvent }
			showJetpackPowered
		/>
	);
};

export default NewsletterSetup;
