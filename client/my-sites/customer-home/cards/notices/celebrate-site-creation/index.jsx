/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import isSiteOnPaidPlan from 'state/selectors/is-site-on-paid-plan';
import { getSelectedSiteId } from 'state/ui/selectors';
import CelebrateNotice from '../celebrate-notice';

const CelebrateSiteCreation = ( { checklistMode, displayChecklist, siteHasPaidPlan } ) => {
	const translate = useTranslate();
	const message = siteHasPaidPlan
		? translate( 'Thank you for your purchase!' )
		: translate( 'Your site has been created!' );

	return (
		<CelebrateNotice
			checklistMode={ checklistMode }
			dismissalPreferenceName="home-notice-site-created"
			displayChecklist={ displayChecklist }
			message={ message }
		/>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteHasPaidPlan: isSiteOnPaidPlan( state, siteId ),
	};
};

export default connect( mapStateToProps )( CelebrateSiteCreation );
