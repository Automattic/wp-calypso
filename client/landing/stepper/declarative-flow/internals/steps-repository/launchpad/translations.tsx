import { NEWSLETTER_FLOW, WRITE_FLOW, BUILD_FLOW } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';
import { TranslatedLaunchpadStrings } from './types';

export function getLaunchpadTranslations(
	flow: string | null,
	hasSkippedCheckout = false
): TranslatedLaunchpadStrings {
	const translatedStrings: TranslatedLaunchpadStrings = {
		flowName: translate( 'WordPress.com' ),
		title: translate( 'Your website is ready!' ),
		subtitle: translate( 'Keep up the momentum with these final steps.' ),
	};

	switch ( flow ) {
		case NEWSLETTER_FLOW:
			translatedStrings.flowName = translate( 'Newsletter' );
			translatedStrings.title = translate( "Your newsletter's ready!" );
			translatedStrings.subtitle = translate( 'Now it’s time to let your readers know.' );
			break;
		case WRITE_FLOW:
		case BUILD_FLOW:
			if ( hasSkippedCheckout ) {
				translatedStrings.title = translate( 'Get started with WordPress.com' );
				translatedStrings.launchTitle = translate( 'Get started with WordPress.com' );
			} else {
				translatedStrings.title = translate( "Let's get ready to launch!" );
				translatedStrings.launchTitle = translate( "Let's get ready to launch!" );
			}
			translatedStrings.subtitle = translate( "Here's what to do next." );
	}

	return translatedStrings;
}
