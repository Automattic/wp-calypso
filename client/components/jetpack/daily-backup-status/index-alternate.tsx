/**
 * External dependencies
 */
import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { Interval, EVERY_SECOND } from 'calypso/lib/interval';
import {
	isSuccessfulDailyBackup,
	isSuccessfulRealtimeBackup,
} from 'calypso/lib/jetpack/backup-utils';
import useDateWithOffset from 'calypso/lib/jetpack/hooks/use-date-with-offset';
import QueryRewindBackups from 'calypso/components/data/query-rewind-backups';
import BackupCard from 'calypso/components/jetpack/backup-card';
import BackupFailed from 'calypso/components/jetpack/backup-card/backup-failed';
import BackupJustCompleted from 'calypso/components/jetpack/backup-card/backup-just-completed';
import BackupInProgress from 'calypso/components/jetpack/backup-card/backup-in-progress';
import BackupScheduled from 'calypso/components/jetpack/backup-card/backup-scheduled';
import NoBackupsOnSelectedDate from 'calypso/components/jetpack/backup-card/no-backups-on-selected-date';
import NoBackupsYet from 'calypso/components/jetpack/backup-card/no-backups-yet';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { getInProgressBackupForSite, siteHasRealtimeBackups } from 'calypso/state/rewind/selectors';
import { requestRewindBackups } from 'calypso/state/rewind/backups/actions';

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

const DailyBackupStatusAlternate: React.FC< Props > = ( {
	selectedDate,
	lastBackupDate,
	backup,
	isLatestBackup,
	dailyDeltas,
} ) => {
	const siteId = useSelector( getSelectedSiteId ) as number;

	const moment = useLocalizedMoment();
	const today = useDateWithOffset( moment() );

	const dispatch = useDispatch();
	const refreshBackupProgress = useCallback( () => dispatch( requestRewindBackups( siteId ) ), [
		dispatch,
		siteId,
	] );

	const hasRealtimeBackups = useSelector( ( state ) => siteHasRealtimeBackups( state, siteId ) );

	const backupCurrentlyInProgress = useSelector( ( state ) =>
		getInProgressBackupForSite( state, siteId )
	);

	// If a backup is in progress when the component first loads,
	// we'll "lose" the data we know about it when it finishes;
	// adding a ref here makes sure we hold onto that data.
	const backupPreviouslyInProgress = useRef();
	useEffect( () => {
		if ( backupCurrentlyInProgress ) {
			backupPreviouslyInProgress.current = backupCurrentlyInProgress;
		}
	}, [ backupCurrentlyInProgress ] );

	// If we're looking at today and a backup is in progress,
	// start tracking and showing progress
	if ( selectedDate.isSame( today, 'day' ) && backupCurrentlyInProgress ) {
		// Start polling the backup status endpoint every second for updates
		return (
			<>
				<Interval onTick={ refreshBackupProgress } period={ EVERY_SECOND } />
				<BackupInProgress
					percent={ backupCurrentlyInProgress.percent }
					lastBackupDate={ lastBackupDate }
					isFeatured
				/>
			</>
		);
	}

	if ( selectedDate.isSame( today, 'day' ) && backupPreviouslyInProgress.current ) {
		return <BackupJustCompleted lastBackupDate={ lastBackupDate } isFeatured />;
	}

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

export default ( props: Props ): React.ReactElement => {
	const siteId = useSelector( getSelectedSiteId );

	// Fetch the status of the most recent backups
	// to see if there's a backup currently in progress
	return (
		<>
			<QueryRewindBackups siteId={ siteId } />
			<DailyBackupStatusAlternate { ...props } />
		</>
	);
};
