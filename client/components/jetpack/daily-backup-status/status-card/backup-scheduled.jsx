import { isEnabled } from '@automattic/calypso-config';
import { LoadingPlaceholder } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useNextBackupSchedule } from 'calypso/components/jetpack/backup-schedule-setting/hooks';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { INDEX_FORMAT } from 'calypso/lib/jetpack/backup-utils';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { backupMainPath } from 'calypso/my-sites/backup/paths';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ActionButtons from '../action-buttons';
import BackupTips from './backup-tips';
import cloudScheduleIcon from './icons/cloud-schedule.svg';

import './style.scss';

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

	const { hasLoaded, date: nextBackupDate } = useNextBackupSchedule();

	let nextBackupHoursText = null;

	if ( hasLoaded && nextBackupDate ) {
		// Calculate the time difference for hours and minutes
		const hoursForNextBackup = nextBackupDate.diff( today, 'hours' );
		const minutesForNextBackup = nextBackupDate.diff( today, 'minutes' ) % 60;

		// Round up to the next hour if there are remaining minutes
		const totalHoursForNextBackup =
			minutesForNextBackup > 0 ? hoursForNextBackup + 1 : hoursForNextBackup;

		nextBackupHoursText =
			totalHoursForNextBackup <= 1
				? translate( 'In the next hour' )
				: translate( 'In the next %d hour', 'In the next %d hours', {
						args: [ totalHoursForNextBackup ],
						count: totalHoursForNextBackup,
				  } );
	}

	return (
		<>
			<div className="status-card__message-head">
				<img src={ cloudScheduleIcon } alt="" role="presentation" />
				<div className="status-card__hide-mobile">{ translate( 'Backup Scheduled' ) }</div>
			</div>
			<div className="status-card__title">
				<div className="status-card__hide-desktop">{ translate( 'Backup Scheduled' ) }:</div>
				{ hasLoaded && nextBackupHoursText ? (
					<div>{ nextBackupHoursText }</div>
				) : (
					<LoadingPlaceholder height="52px" />
				) }
			</div>
			<p className="status-card__no-backup-last-backup">
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
			</p>
			<ActionButtons disabled />
			{ isEnabled( 'jetpack/backup-messaging-i3' ) && <BackupTips location="SCHEDULED" /> }
		</>
	);
};

export default BackupScheduled;
