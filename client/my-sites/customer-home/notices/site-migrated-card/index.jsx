/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import CelebrateNotice from '../celebrate-notice';

const SiteMigratedCard = ( { checklistMode, displayChecklist } ) => {
	const translate = useTranslate();
	return (
		<CelebrateNotice
			checklistMode={ checklistMode }
			dismissalPreferenceName="home-notice-site-migrated"
			displayChecklist={ displayChecklist }
			message={ translate( 'Your site has been imported!' ) }
		/>
	);
};

export default SiteMigratedCard;
