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

/**
 * Style dependencies
 */
import './style.scss';

export const LaunchSite = ( { isAtomic, isChecklistComplete, launchSite, siteId } ) => {
	const translate = useTranslate();
	const isPrimary = ! isAtomic && isChecklistComplete;
	const onLaunchBannerClick = e => {
		e.preventDefault();
		launchSite( siteId );
	};

	return (
		<Card className="launch-site">
			<CardHeading>{ translate( 'Site Privacy' ) }</CardHeading>
			<h6 className="launch-site__card-subheader">{ translate( 'Your site is private' ) }</h6>
			<p>
				{ translate(
					'Only you and those you invite can view your site. Launch your site to make it visible to the public.'
				) }
			</p>
			<Button primary={ isPrimary } onClick={ onLaunchBannerClick }>
				{ translate( 'Launch my site' ) }
			</Button>
		</Card>
	);
};

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const isAtomic = isAtomicSite( state, siteId );
		const isChecklistComplete = isSiteChecklistComplete( state, siteId );
		return {
			isAtomic,
			isChecklistComplete,
			siteId,
		};
	},
	dispatch => ( {
		launchSite: siteId => dispatch( launchSiteOrRedirectToLaunchSignupFlow( siteId ) ),
	} )
)( LaunchSite );
