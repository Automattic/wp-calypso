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
			message={ translate( 'Your site has been imported!' ) }
			checklistMode={ checklistMode }
			displayChecklist={ displayChecklist }
		/>
	);
};

export default SiteMigratedCard;
