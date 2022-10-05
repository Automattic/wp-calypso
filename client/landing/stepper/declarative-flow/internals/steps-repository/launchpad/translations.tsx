import { LINK_IN_BIO_FLOW, NEWSLETTER_FLOW, VIDEOPRESS_FLOW } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';
import { TranslatedLaunchpadStrings } from './types';

export function getLaunchpadTranslations( flow: string | null ): TranslatedLaunchpadStrings {
	const translatedStrings = {
		flowName: translate( 'WordPress' ),
		sidebarTitle: translate( 'Your website is ready to launch!' ),
		sidebarSubtitle: translate( 'Keep up the momentum with these final steps.' ),
	};

	switch ( flow ) {
		case NEWSLETTER_FLOW:
			translatedStrings.flowName = translate( 'Newsletter' );
			translatedStrings.sidebarTitle = translate( 'Your Newsletter is ready to launch!' );
			break;
		case LINK_IN_BIO_FLOW:
			translatedStrings.flowName = translate( 'Link in Bio' );
			translatedStrings.sidebarTitle = translate( 'Your Link in Bio is ready to launch!' );
			break;
		case VIDEOPRESS_FLOW:
			translatedStrings.flowName = translate( 'Video' );
			translatedStrings.sidebarTitle = translate( 'Your Video site is ready to launch!' );
			break;
		case 'podcast':
			translatedStrings.flowName = translate( 'Podcast' );
			translatedStrings.sidebarTitle = translate( 'Your Podcast is ready to launch!' );
			break;
	}

	return translatedStrings;
}
