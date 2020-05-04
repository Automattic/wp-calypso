/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import CelebrateNotice from '../celebrate-notice-v2';

const CelebrateSiteLaunch = () => {
	const translate = useTranslate();
	return (
		<CelebrateNotice
			actionText={ translate( "Show me what's next" ) }
			description={ translate(
				"Don't forget to share your hard work with everyone. Keep up the momentum with some guidance on what to do next."
			) }
			noticeId="site-launched"
			title={ translate( 'You launched your site!' ) }
		/>
	);
};

export default CelebrateSiteLaunch;
