import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ThankYou, { ThankYouCtaType } from './thank-you';

const ThankYouCta: ThankYouCtaType = ( { dismissUrl, recordThankYouClick } ) => {
	const translate = useTranslate();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug ) as string;
	return (
		<>
			<Button
				primary
				href={ '/media/videos/' + selectedSiteSlug }
				onClick={ () => recordThankYouClick( 'videopress', 'media' ) }
			>
				{ translate( 'Upload a video' ) }
			</Button>
			<Button href={ dismissUrl }>{ translate( 'Skip for now' ) }</Button>
		</>
	);
};

const VideoPressProductThankYou = (): ReactElement => {
	const translate = useTranslate();
	return (
		<ThankYou
			illustration="/calypso/images/illustrations/thankYou.svg"
			ThankYouCtaComponent={ ThankYouCta }
			title={ translate( 'Welcome to Jetpack VideoPress!' ) }
		>
			<>
				<p>{ translate( "We've activated your 1TB of video storage space." ) }</p>
				<p>
					{ translate(
						"To get started, add a video to a post or page through the editor, or upload it to the media library. We'll take care of the rest."
					) }
				</p>
			</>
		</ThankYou>
	);
};

export default VideoPressProductThankYou;
