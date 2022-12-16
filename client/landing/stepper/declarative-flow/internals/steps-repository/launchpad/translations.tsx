import {
	LINK_IN_BIO_FLOW,
	NEWSLETTER_FLOW,
	VIDEOPRESS_FLOW,
	FREE_FLOW,
} from '@automattic/onboarding';
import { translate } from 'i18n-calypso';
import { TranslatedLaunchpadStrings } from './types';

export function getLaunchpadTranslations( flow: string | null ): TranslatedLaunchpadStrings {
	const translatedStrings: TranslatedLaunchpadStrings = {
		flowName: translate( 'WordPress' ),
		title: translate( 'Your website is ready!' ),
		subtitle: translate( 'Keep up the momentum with these final steps.' ),
	};

	switch ( flow ) {
		case NEWSLETTER_FLOW:
			translatedStrings.flowName = translate( 'Newsletter' );
			translatedStrings.title = translate( "You're all set to start publishing" );
			translatedStrings.subtitle = translate(
				'Why not welcome your readers with your first post?'
			);
			break;
		case LINK_IN_BIO_FLOW:
			translatedStrings.flowName = translate( 'Link in Bio' );
			translatedStrings.title = translate( "You're ready to link and launch" );
			translatedStrings.launchTitle = translate( "You're ready to link and launch" );
			translatedStrings.subtitle = translate(
				"All that's left is to add some links and launch your site."
			);
			break;
		case FREE_FLOW:
			translatedStrings.flowName = translate( 'Free Website' );
			translatedStrings.title = translate( 'Your website is almost ready!' );
			translatedStrings.launchTitle = translate( 'Your website is almost ready!' );
			translatedStrings.subtitle = translate( 'Keep the momentum going with these final steps.' );
			break;
		case VIDEOPRESS_FLOW:
			translatedStrings.flowName = translate( 'Video' );
			translatedStrings.title = translate( 'Your site is almost ready!' );
			translatedStrings.launchTitle = translate( 'Your site is almost ready!' );
			break;
	}

	return translatedStrings;
}
