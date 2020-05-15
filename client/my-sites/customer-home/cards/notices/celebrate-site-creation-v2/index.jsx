/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import CelebrateNotice from '../celebrate-notice-v2';

const CelebrateSiteCreation = () => {
	const translate = useTranslate();

	return (
		<CelebrateNotice
			actionText={ translate( 'Get started' ) }
			description={ translate(
				"Next, we'll guide you through setting up and launching your site."
			) }
			noticeId="site-created"
			title={ translate( 'Your site has been created!' ) }
		/>
	);
};

export default CelebrateSiteCreation;
