import { translate } from 'i18n-calypso';
import { TranslatedLaunchpadStrings } from './types';

export function getLaunchpadTranslations( flow: string | null ): TranslatedLaunchpadStrings {
	const translatedStrings = {
		flowName: translate( 'WordPress' ),
		sidebarTitle: translate( 'Voilà! Your website is ready to launch!' ),
		sidebarSubtitle: translate( 'Keep up the momentum with these final steps.' ),
	};

	switch ( flow ) {
		case 'newsletter':
			translatedStrings.flowName = translate( 'Newsletter' );
			translatedStrings.sidebarTitle = translate( 'Voilà! Your Newsletter is ready to launch!' );
			break;
		case 'link-in-bio':
			translatedStrings.flowName = translate( 'Link in Bio' );
			translatedStrings.sidebarTitle = translate( 'Voilà! Your Link in Bio is ready to launch!' );
			break;
		case 'podcast':
			translatedStrings.flowName = translate( 'Podcast' );
			translatedStrings.sidebarTitle = translate( 'Voilà! Your Podcast is ready to launch!' );
			break;
	}

	return translatedStrings;
}
