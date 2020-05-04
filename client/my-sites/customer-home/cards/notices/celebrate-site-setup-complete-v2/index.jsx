/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import CelebrateNotice from '../celebrate-notice-v2';

const CelebrateSiteSetupComplete = () => {
	const translate = useTranslate();
	return (
		<CelebrateNotice
			actionText={ translate( "Show me what's next" ) }
			description={ translate(
				"You finished your site setup. We'll guide you on the next steps to start growing your site."
			) }
			noticeId="site-setup-complete"
			title={ translate( 'Site setup complete!' ) }
		/>
	);
};

export default CelebrateSiteSetupComplete;
