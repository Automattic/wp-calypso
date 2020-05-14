/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import CelebrateNotice from '../celebrate-notice-v2';

/**
 * Image dependencies
 */
import migrationIllustration from 'assets/images/customer-home/illustration--import-complete.svg';

const CelebrateSiteMigration = () => {
	const translate = useTranslate();
	return (
		<CelebrateNotice
			actionText={ translate( "Show me what's next" ) }
			description={ translate(
				"You finished importing your site. We'll guide you on the next steps to start growing your site."
			) }
			noticeId="site-migrated"
			title={ translate( 'Your site has been imported!' ) }
			illustration={ migrationIllustration }
			showSkip={ true }
			skipText={ translate( 'Dismiss' ) }
		/>
	);
};

export default CelebrateSiteMigration;
