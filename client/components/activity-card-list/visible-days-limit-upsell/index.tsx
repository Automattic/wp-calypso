import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import ActivityCard from 'calypso/components/activity-card';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import ActivityLogItem from 'calypso/my-sites/activity/activity-log-item';
import { useSelector } from 'calypso/state';
import { getJetpackStorageUpgradeUrl } from 'calypso/state/plans/selectors';
import getActivityLogVisibleDays from 'calypso/state/rewind/selectors/get-activity-log-visible-days';
import getSiteSlug from 'calypso/state/sites/selectors/get-site-slug';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useTrackUpsellView, useTrackUpgradeClick } from './hooks';
import type { Activity } from 'calypso/components/activity-card/types';

import './style.scss';

const PLACEHOLDER_ACTIVITY: Activity = {
	actorName: 'Jetpack',
	actorRole: '',
	actorType: 'Application',
	activityId: -1,
	activityName: '',
	activityMedia: {
		available: false,
		medium_url: '',
		name: '',
		thumbnail_url: '',
		type: '',
		url: '',
	},
	activityTs: 1609459200000,
	activityIcon: 'cloud',
	activityIsRewindable: false,
	activityStatus: 'success',
	activityTitle: '',
	activityDescription: [ {} ],
};

type OwnProps = {
	cardClassName?: string;
};

const VisibleDaysLimitUpsell: React.FC< OwnProps > = ( { cardClassName } ) => {
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId ) as number;
	const visibleDays = useSelector( ( state ) => getActivityLogVisibleDays( state, siteId ) );
	const trackUpgradeClick = useTrackUpgradeClick( siteId );

	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const storageUpgradeUrl = getJetpackStorageUpgradeUrl( siteSlug );

	const upsellRef = useTrackUpsellView( siteId );

	if ( visibleDays == null || ! Number.isInteger( visibleDays ) ) {
		return null;
	}

	const card =
		isJetpackCloud() || isEnabled( 'activity-log/v2' ) ? (
			<ActivityCard className={ cardClassName } activity={ PLACEHOLDER_ACTIVITY } />
		) : (
			<ActivityLogItem
				className={ cardClassName }
				siteId={ siteId }
				activity={ PLACEHOLDER_ACTIVITY }
			/>
		);

	return (
		<div className="visible-days-limit-upsell">
			<div className="visible-days-limit-upsell__next-activity">{ card }</div>
			<div className="visible-days-limit-upsell__call-to-action">
				<h3 className="visible-days-limit-upsell__call-to-action-header">
					{ translate(
						'Restore backups older than %(retentionDays)d day',
						'Restore backups older than %(retentionDays)d days',
						{
							count: visibleDays,
							args: { retentionDays: visibleDays },
						}
					) }
				</h3>
				<p className="visible-days-limit-upsell__call-to-action-copy">
					{ translate(
						'Your activity log spans more than %(retentionDays)d day. Upgrade your backup storage to access activity older than %(retentionDays)d day.',
						'Your activity log spans more than %(retentionDays)d days. Upgrade your backup storage to access activity older than %(retentionDays)d days.',
						{
							count: visibleDays,
							args: { retentionDays: visibleDays },
						}
					) }
				</p>
				<Button
					primary
					ref={ upsellRef }
					className="visible-days-limit-upsell__call-to-action-button"
					onClick={ trackUpgradeClick }
					href={ storageUpgradeUrl }
				>
					{ translate( 'Upgrade storage' ) }
				</Button>
			</div>
		</div>
	);
};

export default VisibleDaysLimitUpsell;
