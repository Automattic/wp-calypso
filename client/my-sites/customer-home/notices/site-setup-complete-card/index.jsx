/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import CelebrateNotice from '../celebrate-notice';

const SiteSetupCompleteCard = ( { displayChecklist } ) => {
	const translate = useTranslate();
	return (
		<CelebrateNotice
			dismissalPreferenceName="home-notice-site-setup-complete"
			displayChecklist={ displayChecklist }
			message={ translate( "You've completed each item in your checklist." ) }
		/>
	);
};

export default SiteSetupCompleteCard;
