/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import CelebrateNotice from '../celebrate-notice';

const SiteLaunchedCard = ( { checklistMode, displayChecklist } ) => {
	const translate = useTranslate();
	return (
		<CelebrateNotice
			checklistMode={ checklistMode }
			dismissalPreferenceName="home-notice-site-launched"
			displayChecklist={ displayChecklist }
			message={ translate( 'You launched your site!' ) }
		/>
	);
};

export default SiteLaunchedCard;
