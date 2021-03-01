/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { useTranslate } from 'i18n-calypso';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { INDEX_FORMAT } from 'calypso/lib/jetpack/backup-utils';
import { backupMainPath } from 'calypso/my-sites/backup/paths';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import ActionButtons from '../action-buttons';

/**
 * Style dependencies
 */
import './style.scss';
import cloudScheduleIcon from './icons/cloud-schedule.svg';

const BackupScheduled = ( { lastBackupDate } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const moment = useLocalizedMoment();
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );

	const today = applySiteOffset( moment(), {
		timezone: timezone,
		gmtOffset: gmtOffset,
	} );
	const yesterday = moment( today ).subtract( 1, 'days' );

	const lastBackupDay = lastBackupDate.isSame( yesterday, 'day' )
		? translate( 'Yesterday ' )
		: lastBackupDate.format( 'll' );

	const lastBackupTime = lastBackupDate.format( 'LT' );

	// Calculates the remaining hours for the next backup + 3 hours of safety margin
	const DAY_HOURS = 24;
	const hoursForNextBackup = DAY_HOURS - today.diff( lastBackupDate, 'hours' ) + 3;

	const nextBackupHoursText =
		hoursForNextBackup <= 1
			? translate( 'In the next hour' )
			: translate( 'In the next %d hour', 'In the next %d hours', {
					args: [ hoursForNextBackup ],
					count: hoursForNextBackup,
			  } );

	return (
		<>
			<div className="status-card__message-head">
				<img src={ cloudScheduleIcon } alt="" role="presentation" />
				<div className="status-card__hide-mobile">{ translate( 'Backup Scheduled' ) }</div>
			</div>
			<div className="status-card__title">
				<div className="status-card__hide-desktop">{ translate( 'Backup Scheduled' ) }:</div>
				<div>{ nextBackupHoursText }</div>
			</div>
			<div className="status-card__no-backup-last-backup">
				{ translate( 'Last daily backup: {{link}}%(lastBackupDay)s %(lastBackupTime)s{{/link}}', {
					args: { lastBackupDay, lastBackupTime },
					components: {
						link: (
							<a
								href={ backupMainPath( siteSlug, {
									date: lastBackupDate.format( INDEX_FORMAT ),
								} ) }
							/>
						),
					},
				} ) }
			</div>
			<ActionButtons disabled />
		</>
	);
};

export default BackupScheduled;
