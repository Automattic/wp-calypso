/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { isMobile } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import GoMobile from 'my-sites/customer-home/cards/features/go-mobile';
import ChecklistSiteSetup from 'my-sites/customer-home/cards/primary/checklist-site-setup';
import QuickLinks from 'my-sites/customer-home/cards/primary/quick-links';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import isEligibleForDotcomChecklist from 'state/selectors/is-eligible-for-dotcom-checklist';
import isSiteChecklistComplete from 'state/selectors/is-site-checklist-complete';
import { getSelectedSiteId } from 'state/ui/selectors';

const Primary = ( { checklistMode, displayChecklist } ) => {
	return (
		<div className="primary">
			{ // "Go Mobile" is displayed on the primary location when viewed in smaller viewports, so folks
			// can see it on their phone without needing to scroll.
			isMobile() && <GoMobile /> }
			{ displayChecklist && <ChecklistSiteSetup checklistMode={ checklistMode } /> }
			{ ! displayChecklist && <QuickLinks /> }
		</div>
	);
};

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );

	const siteChecklist = getSiteChecklist( state, siteId );
	const hasChecklistData = null !== siteChecklist && Array.isArray( siteChecklist.tasks );
	const isChecklistComplete = isSiteChecklistComplete( state, siteId );

	return {
		displayChecklist:
			isEligibleForDotcomChecklist( state, siteId ) && hasChecklistData && ! isChecklistComplete,
	};
};

export default connect( mapStateToProps )( Primary );
