/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import isSiteChecklistComplete from 'state/selectors/is-site-checklist-complete';
import { getSelectedSiteId } from 'state/ui/selectors';
import CelebrateNotice from '../celebrate-notice-v2';

const CelebrateSiteLaunch = ( { isSiteSetupComplete } ) => {
	const translate = useTranslate();
	return (
		<CelebrateNotice
			actionText={
				isSiteSetupComplete ? translate( "Show me what's next" ) : translate( 'Show site setup' )
			}
			description={ translate(
				"Don't forget to share your hard work with everyone. Keep up the momentum with some guidance on what to do next."
			) }
			noticeId="site-launched"
			title={ translate( 'You launched your site!' ) }
			showSkip={ true }
			skipText={ isSiteSetupComplete ? translate( 'Dismiss' ) : translate( 'Skip site setup' ) }
		/>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		isSiteSetupComplete: isSiteChecklistComplete( state, siteId ),
	};
} )( CelebrateSiteLaunch );
