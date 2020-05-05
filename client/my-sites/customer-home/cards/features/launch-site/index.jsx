/**
 * External dependencies
 */
import React from 'react';
import { Card, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import { getSelectedSiteId } from 'state/ui/selectors';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import isSiteChecklistComplete from 'state/selectors/is-site-checklist-complete';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'state/sites/launch/actions';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

export const LaunchSite = ( { isPrimary, launchSiteAndTrack, siteId } ) => {
	const translate = useTranslate();

	return (
		<Card className="launch-site">
			<CardHeading>{ translate( 'Site Privacy' ) }</CardHeading>
			<h6 className="customer-home__card-subheader launch-site__card-subheader">
				{ translate( 'Your site is private' ) }
			</h6>
			<p>
				{ translate(
					'Only you and those you invite can view your site. Launch your site to make it visible to the public.'
				) }
			</p>
			<Button primary={ isPrimary } onClick={ () => launchSiteAndTrack( siteId ) }>
				{ translate( 'Launch my site' ) }
			</Button>
		</Card>
	);
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const isAtomic = isAtomicSite( state, siteId );
		const isChecklistComplete = isSiteChecklistComplete( state, siteId );
		const isPrimary = ! isAtomic && isChecklistComplete;
		return {
			isPrimary,
			siteId,
		};
	},
	( dispatch ) => ( {
		trackAction: ( siteId ) =>
			dispatch(
				composeAnalytics(
					recordTracksEvent( 'calypso_customer_home_launch_my_site_click', {
						site_id: siteId,
					} ),
					bumpStat( 'calypso_customer_home', 'launch_my_site' )
				)
			),
		launchSite: ( siteId ) => dispatch( launchSiteOrRedirectToLaunchSignupFlow( siteId ) ),
	} ),
	( stateProps, dispatchProps, ownProps ) => ( {
		...ownProps,
		...stateProps,
		launchSiteAndTrack: ( siteId ) => {
			dispatchProps.launchSite( siteId );
			dispatchProps.trackAction( siteId );
		},
	} )
)( LaunchSite );
