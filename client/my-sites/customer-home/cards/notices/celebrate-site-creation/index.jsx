/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import CelebrateNotice from 'calypso/my-sites/customer-home/cards/notices/celebrate-notice';
import { NOTICE_CELEBRATE_SITE_CREATION } from 'calypso/my-sites/customer-home/cards/constants';

const CelebrateSiteCreation = () => {
	const translate = useTranslate();

	return (
		<CelebrateNotice
			actionText={ translate( 'Get started' ) }
			description={ translate(
				"Next, we'll guide you through setting up and launching your site."
			) }
			noticeId={ NOTICE_CELEBRATE_SITE_CREATION }
			title={ translate( 'Your site has been created!' ) }
		/>
	);
};

export default CelebrateSiteCreation;
