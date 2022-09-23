import { LINK_IN_BIO_FLOW, NEWSLETTER_FLOW } from '@automattic/onboarding';
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
			translatedStrings.title = translate( 'Your Newsletter is ready!' );
			break;
		case LINK_IN_BIO_FLOW:
			translatedStrings.flowName = translate( 'Link in Bio' );
			translatedStrings.title = translate( 'Your Link in Bio is almost ready!' );
			translatedStrings.launchTitle = translate( 'Your Link in Bio is ready to launch!' );
			break;
	}

	return translatedStrings;
}
