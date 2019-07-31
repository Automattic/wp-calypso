/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import { isCurrentUserEmailVerified } from 'state/current-user/selectors';
import { isJetpackSite, isCurrentPlanPaid } from 'state/sites/selectors';
import { launchSite } from 'state/sites/launch/actions';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { connect } from 'react-redux';

export const LaunchStatusNotice = ( { translate, siteSlug, siteIsLaunched, siteIsJetpack } ) => {
	if ( siteIsLaunched || siteIsJetpack ) {
		return null;
	}

	// TODO: if user has paid plan && domain, this should just dispatch the launchSite action directly
	// similar logic is in my-sites/site-settings/form-general.jsx#L405
	const noticeAction = `/start/launch-site?siteSlug=${ siteSlug }`;

	return (
		<Notice
			icon="info-outline"
			isCompact
			status="is-info"
			text={ translate( 'Your site is private and only visible to you.', {
				comment: 'Sidebar notice to user about whether or not their site is public.',
			} ) }
		>
			<NoticeAction href={ noticeAction }>
				{ translate( 'Launch', { context: 'verb' } ) }
			</NoticeAction>
		</Notice>
	);
};

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );

		return {
			siteSlug: getSelectedSiteSlug( state ),
			siteIsJetpack: isJetpackSite( state, siteId ),
			siteIsLaunched: ! isUnlaunchedSite( state, siteId ),
			needsVerification: ! isCurrentUserEmailVerified( state ),
			isPaidPlan: isCurrentPlanPaid( state, siteId ),
		};
	},
	{ recordTracksEvent, launchSite }
)( localize( LaunchStatusNotice ) );
