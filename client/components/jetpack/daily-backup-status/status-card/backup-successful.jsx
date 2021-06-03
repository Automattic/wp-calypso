/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getRewindCapabilities from 'calypso/state/selectors/get-rewind-capabilities';
import ActivityCard from 'calypso/components/activity-card';
import { useActionableRewindId } from 'calypso/lib/jetpack/actionable-rewind-id';
import ActionButtons from '../action-buttons';
import BackupChanges from '../backup-changes';
import useGetDisplayDate from '../use-get-display-date';
import ExternalLink from 'calypso/components/external-link';
import isJetpackSiteMultiSite from 'calypso/state/sites/selectors/is-jetpack-site-multi-site';
import { preventWidows } from 'calypso/lib/formatting';

/**
 * Style dependencies
 */
import './style.scss';
import cloudSuccessIcon from './icons/cloud-success.svg';

const BackupSuccessful = ( { backup, deltas, selectedDate } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isMultiSite = useSelector( ( state ) => isJetpackSiteMultiSite( state, siteId ) );
	const hasRealtimeBackups = useSelector( ( state ) => {
		const capabilities = getRewindCapabilities( state, siteId );
		return Array.isArray( capabilities ) && capabilities.includes( 'backup-realtime' );
	} );

	const moment = useLocalizedMoment();
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );

	const getDisplayDate = useGetDisplayDate();
	const displayDate = getDisplayDate( backup.activityTs );
	const displayDateNoLatest = getDisplayDate( backup.activityTs, false );

	const today = applySiteOffset( moment(), {
		timezone: timezone,
		gmtOffset: gmtOffset,
	} );
	const isToday = selectedDate.isSame( today, 'day' );

	const meta = backup?.activityDescription?.[ 2 ]?.children?.[ 0 ] ?? '';

	// We should only showing the summarized ActivityCard for Real-time sites when the latest backup is not a full backup
	const showBackupDetails =
		hasRealtimeBackups &&
		( 'rewind__backup_complete_full' !== backup.activityName ||
			'rewind__backup_only_complete_full' !== backup.activityName );

	const actionableRewindId = useActionableRewindId( backup );

	const multiSiteInfoLink = `https://jetpack.com/redirect?source=jetpack-support-backup&anchor=does-jetpack-backup-support-multisite`;

	return (
		<>
			<div className="status-card__message-head">
				<img src={ cloudSuccessIcon } alt="" role="presentation" />
				<div className="status-card__hide-mobile">
					{ isToday ? translate( 'Latest backup' ) : translate( 'Latest backup on this day' ) }
				</div>
			</div>
			<div className="status-card__hide-desktop">
				<div className="status-card__title">{ displayDate }</div>
			</div>
			<div className="status-card__hide-mobile">
				<div className="status-card__title">{ displayDateNoLatest }</div>
			</div>
			<div className="status-card__meta">{ meta }</div>
			{ isMultiSite && (
				<div className="status-card__multisite-warning">
					<div className="status-card__multisite-warning-title">
						{ preventWidows( translate( 'This site is a WordPress Multisite installation.' ) ) }
					</div>
					<p className="status-card__multisite-warning-info">
						{ preventWidows(
							translate(
								'Jetpack Backup for Multisite installations provides downloadable backups, no one-click restores. ' +
									'For more information {{ExternalLink}}visit our documentation page{{/ExternalLink}}.',
								{
									components: {
										ExternalLink: (
											<ExternalLink
												href={ multiSiteInfoLink }
												target="_blank"
												rel="noopener noreferrer"
												icon={ true }
											/>
										),
									},
								}
							)
						) }
					</p>
				</div>
			) }
			<ActionButtons rewindId={ actionableRewindId } isMultiSite={ isMultiSite } />
			{ showBackupDetails && (
				<div className="status-card__realtime-details">
					<div className="status-card__realtime-details-card">
						<ActivityCard activity={ backup } summarize />
					</div>
				</div>
			) }
			{ ! hasRealtimeBackups && <BackupChanges deltas={ deltas } /* metaDiff={ metaDiff */ /> }
		</>
	);
};

export default BackupSuccessful;
