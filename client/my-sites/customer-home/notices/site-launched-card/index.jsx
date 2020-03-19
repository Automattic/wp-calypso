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
			message={ translate( 'You launched your site!' ) }
			checklistMode={ checklistMode }
			displayChecklist={ displayChecklist }
		/>
	);
};

export default SiteLaunchedCard;
