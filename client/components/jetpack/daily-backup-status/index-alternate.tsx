/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import BackupFailed from 'calypso/components/jetpack/backup-card/backup-failed';
import NoBackupsOnSelectedDate from 'calypso/components/jetpack/backup-card/no-backups-on-selected-date';
import BackupScheduled from 'calypso/components/jetpack/backup-card/backup-scheduled';
import NoBackupsYet from 'calypso/components/jetpack/backup-card/no-backups-yet';
import BackupCard from 'calypso/components/jetpack/backup-card';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import {
	isSuccessfulDailyBackup,
	isSuccessfulRealtimeBackup,
} from 'calypso/lib/jetpack/backup-utils';
import useDateWithOffset from 'calypso/lib/jetpack/hooks/use-date-with-offset';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { siteHasRealtimeBackups } from './selectors';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Type dependencies
 */
import type { Moment } from 'moment';
import type { Activity } from 'calypso/state/activity-log/types';

type Props = {
	selectedDate: Moment;
	lastBackupDate?: Moment;
	backup: Activity;
	isLatestBackup?: boolean;
	dailyDeltas?: Activity[];
};

const DailyBackupStatusAlternate: FunctionComponent< Props > = ( {
	selectedDate,
	lastBackupDate,
	backup,
	isLatestBackup,
	dailyDeltas,
} ) => {
	const siteId = useSelector( getSelectedSiteId ) as number;

	const moment = useLocalizedMoment();
	const today = useDateWithOffset( moment() );

	const hasRealtimeBackups = useSelector( ( state ) => siteHasRealtimeBackups( state, siteId ) );

	if ( backup ) {
		const isSuccessful = hasRealtimeBackups ? isSuccessfulRealtimeBackup : isSuccessfulDailyBackup;

		return isSuccessful( backup ) ? (
			<BackupCard
				activity={ backup }
				subActivities={ dailyDeltas }
				isLatest={ !! isLatestBackup }
				isFeatured
			/>
		) : (
			<BackupFailed backup={ backup } isFeatured />
		);
	}

	if ( lastBackupDate ) {
		return selectedDate.isSame( today, 'day' ) ? (
			<BackupScheduled lastBackupDate={ lastBackupDate } isFeatured />
		) : (
			<NoBackupsOnSelectedDate selectedDate={ selectedDate } isFeatured />
		);
	}

	return <NoBackupsYet isFeatured />;
};

export default DailyBackupStatusAlternate;
