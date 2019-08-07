/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import { isCurrentUserEmailVerified } from 'state/current-user/selectors';
import { isJetpackSite, isCurrentPlanPaid } from 'state/sites/selectors';
import { launchSite } from 'state/sites/launch/actions';

export const LaunchStatusNotice = ( { translate, siteIsLaunched, siteIsJetpack } ) => {
	if ( siteIsLaunched || siteIsJetpack ) {
		return null;
	}

	return (
		<Notice
			icon="info-outline"
			isCompact
			text={ translate( 'Your site is only visible to you.', {
				comment: 'Sidebar notice to user about whether or not their site is public.',
			} ) }
		/>
	);
};

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );

		return {
			siteIsJetpack: isJetpackSite( state, siteId ),
			siteIsLaunched: ! isUnlaunchedSite( state, siteId ),
			needsVerification: ! isCurrentUserEmailVerified( state ),
			isPaidPlan: isCurrentPlanPaid( state, siteId ),
		};
	},
	{ recordTracksEvent, launchSite }
)( localize( LaunchStatusNotice ) );
