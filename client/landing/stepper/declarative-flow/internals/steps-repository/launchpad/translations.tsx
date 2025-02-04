import {
	LINK_IN_BIO_TLD_FLOW,
	NEWSLETTER_FLOW,
	WRITE_FLOW,
	BUILD_FLOW,
	START_WRITING_FLOW,
	DESIGN_FIRST_FLOW,
} from '@automattic/onboarding';
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
		case LINK_IN_BIO_TLD_FLOW:
			translatedStrings.flowName = translate( 'Link in Bio' );
			translatedStrings.title = translate( "You're ready to link and launch" );
			translatedStrings.launchTitle = translate( "You're ready to link and launch" );
			translatedStrings.subtitle = translate(
				"All that's left is to add some links and launch your site."
			);
			break;
		case START_WRITING_FLOW:
		case DESIGN_FIRST_FLOW:
			translatedStrings.flowName = translate( 'Blog' );
			translatedStrings.title = translate( "Your blog's almost ready!" );
			translatedStrings.launchTitle = translate( "Your blog's almost ready!" );
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
