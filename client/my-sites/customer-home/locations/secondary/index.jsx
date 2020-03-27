/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { isMobile } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import FreePhotoLibrary from 'my-sites/customer-home/cards/education/free-photo-library';
import GoMobile from 'my-sites/customer-home/cards/features/go-mobile';
import GrowEarn from 'my-sites/customer-home/cards/features/grow-earn';
import LaunchSite from 'my-sites/customer-home/cards/features/launch-site';
import Stats from 'my-sites/customer-home/cards/features/stats';
import Support from 'my-sites/customer-home/cards/features/support';
import { isCurrentUserEmailVerified } from 'state/current-user/selectors';
import isSiteChecklistComplete from 'state/selectors/is-site-checklist-complete';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import { getSelectedSiteId } from 'state/ui/selectors';

const Secondary = ( { isChecklistComplete, needsEmailVerification, siteIsUnlaunched } ) => {
	return (
		<div className="secondary">
			{ siteIsUnlaunched && ! needsEmailVerification && <LaunchSite /> }
			{ ! siteIsUnlaunched && <Stats /> }
			{ <FreePhotoLibrary /> }
			{ ! siteIsUnlaunched && isChecklistComplete && <GrowEarn /> }
			<Support />
			{ // "Go Mobile" has the lowest priority placement when viewed in bigger viewports.
			! isMobile() && <GoMobile /> }
		</div>
	);
};

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );

	return {
		isChecklistComplete: isSiteChecklistComplete( state, siteId ),
		needsEmailVerification: ! isCurrentUserEmailVerified( state ),
		siteIsUnlaunched: isUnlaunchedSite( state, siteId ),
	};
};

export default connect( mapStateToProps )( Secondary );
