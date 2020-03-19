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
			message={ translate( "You've completed each item in your checklist." ) }
			displayChecklist={ displayChecklist }
		/>
	);
};

export default SiteSetupCompleteCard;
