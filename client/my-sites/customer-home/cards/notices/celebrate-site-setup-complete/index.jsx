/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import CelebrateNotice from 'calypso/my-sites/customer-home/cards/notices/celebrate-notice';
import { NOTICE_CELEBRATE_SITE_SETUP_COMPLETE } from 'calypso/my-sites/customer-home/cards/constants';

/**
 * Image dependencies
 */
import checklistIllustration from 'calypso/assets/images/customer-home/illustration--checklist-complete.svg';

const CelebrateSiteSetupComplete = () => {
	const translate = useTranslate();
	return (
		<CelebrateNotice
			actionText={ translate( "Show me what's next" ) }
			description={ translate(
				"You finished your site setup. We'll guide you on the next steps to start growing your site."
			) }
			noticeId={ NOTICE_CELEBRATE_SITE_SETUP_COMPLETE }
			title={ translate( 'Site setup complete!' ) }
			illustration={ checklistIllustration }
			showSkip
			skipText={ translate( 'Dismiss' ) }
		/>
	);
};

export default CelebrateSiteSetupComplete;
