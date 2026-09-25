import { StepContainer } from '@automattic/onboarding';
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

/**
 * First step of the `videopress-channel` flow: name the channel and describe it.
 *
 * The title becomes the site title (and the `*.wordpress.com` address suggestion), the description
 * becomes the tagline the channel theme shows under the channel name. The optional icon becomes the
 * site icon, which the theme uses as the channel avatar.
 */
const VideoPressChannelSetup: Step< {
	submits: {
		siteTitle: string;
		tagline: string;
	};
} > = ( { navigation } ) => {
	const { submit } = navigation;
	const translate = useTranslate();
	const site = useSite();

	const channelFormText = {
		titleLabel: translate( 'Name your channel' ),
		titlePlaceholder: translate( 'Trail Kitchen' ),
		titleMissing: translate( 'Your channel needs a name.' ),
		taglineLabel: translate( 'What is your channel about?' ),
		taglinePlaceholder: translate( 'Camp cooking, one fire at a time.' ),
		iconPlaceholder: translate( 'Add a channel avatar' ),
		buttonText: translate( 'Create my channel' ),
	};

	const { setSiteTitle, setSiteDescription, setSiteLogo } = useDispatch( ONBOARD_STORE );

	const [ invalidSiteTitle, setInvalidSiteTitle ] = useState( false );
	const [ siteTitle, setComponentSiteTitle ] = useState( '' );
	const [ tagline, setTagline ] = useState( '' );
	const [ base64Image, setBase64Image ] = useState< string | null >();
	const [ selectedFile, setSelectedFile ] = useState< File | undefined >();
	const state = useSelect( ( select ) => select( ONBOARD_STORE ) as OnboardSelect, [] ).getState();

	useEffect( () => {
		const { siteTitle: storedTitle, siteDescription } = state;

		setTagline( siteDescription );
		setComponentSiteTitle( storedTitle );
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

		const trimmedTitle = siteTitle.trim();
		setInvalidSiteTitle( ! trimmedTitle.length );

		setSiteDescription( tagline );
		setSiteTitle( trimmedTitle );

		if ( selectedFile && base64Image ) {
			setSiteLogo( base64Image );
		}

		if ( trimmedTitle.length ) {
			recordTracksEvent( 'calypso_videopress_channel_setup_submit', {
				has_tagline: !! tagline.trim().length,
				has_avatar: !! ( selectedFile && base64Image ),
			} );
			submit?.( { siteTitle: trimmedTitle, tagline } );
		}
	};

	return (
		<StepContainer
			stepName="videopress-channel-setup"
			isWideLayout
			flowName="videopress-channel"
			hideBack
			formattedHeader={
				<FormattedHeader
					id="videopress-channel-setup-header"
					headerText={ translate( 'Name your channel' ) }
					subHeaderText={ translate(
						'Your channel is a WordPress.com site powered by VideoPress. You can change all of this later.'
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
					translatedText={ channelFormText }
					className="videopress-channel-setup-form"
				/>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default VideoPressChannelSetup;
