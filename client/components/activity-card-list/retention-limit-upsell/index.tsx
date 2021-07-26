/**
 * External dependencies
 */
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { preventWidows } from 'calypso/lib/formatting/prevent-widows';
import getSiteActivityLogRetentionDays from 'calypso/state/selectors/get-site-activity-log-retention-days';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import ActivityCard from 'calypso/components/activity-card';
import { useTrackUpsellView, useTrackUpgradeClick } from './hooks';

/**
 * Style dependencies
 */
import './style.scss';

const PLACEHOLDER_ACTIVITY = {
	actorName: 'Jetpack',
	actorRemoteId: 0,
	actorWpcomId: 0,
	actorRole: '',
	actorType: 'Application',
	activityDate: '2021-01-01T00:00:00.000+00:00',
	activityTs: 1609459200000,
	activityGroup: 'rewind',
	activityIcon: 'cloud',
	activityType: 'Backup',
	activityTitle: '',
	activityDescription: [],
};

const RetentionLimitUpsell: React.FC = ( { cardClassName } ) => {
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId ) as number;
	const retentionDays = useSelector( ( state ) =>
		getSiteActivityLogRetentionDays( state, siteId )
	);
	const trackUpgradeClick = useTrackUpgradeClick( siteId );

	const upsellRef = useTrackUpsellView( siteId );

	if ( ! Number.isInteger( retentionDays ) ) {
		return null;
	}

	return (
		<div className="retention-limit-upsell">
			<div className="retention-limit-upsell__next-activity">
				<ActivityCard className={ cardClassName } activity={ PLACEHOLDER_ACTIVITY } />
			</div>
			<div className="retention-limit-upsell__call-to-action">
				<h3 className="retention-limit-upsell__call-to-action-header">
					{ preventWidows(
						translate(
							'Restore backups older than %(retentionDays)d day',
							'Restore backups older than %(retentionDays)d days',
							{
								count: retentionDays as number,
								args: { retentionDays },
							}
						)
					) }
				</h3>
				<p className="retention-limit-upsell__call-to-action-copy">
					{ preventWidows(
						translate(
							'Your activity log spans more than %(retentionDays)d day. Upgrade your backup storage to access activity older than %(retentionDays)d day.',
							'Your activity log spans more than %(retentionDays)d days. Upgrade your backup storage to access activity older than %(retentionDays)d days.',
							{
								count: retentionDays as number,
								args: { retentionDays },
							}
						)
					) }
				</p>
				<Button
					primary
					ref={ upsellRef }
					className="retention-limit-upsell__call-to-action-button"
					onClick={ trackUpgradeClick }
					href="/pricing"
				>
					{ translate( 'Upgrade storage' ) }
				</Button>
			</div>
		</div>
	);
};

export default RetentionLimitUpsell;
