/**
 * External dependencies
 */
import { Card } from '@automattic/components';
import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import useDateWithOffset from 'calypso/lib/jetpack/hooks/use-date-with-offset';
import { Interval, EVERY_SECOND } from 'calypso/lib/interval';
import {
	isSuccessfulDailyBackup,
	isSuccessfulRealtimeBackup,
} from 'calypso/lib/jetpack/backup-utils';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { getInProgressBackupForSite, siteHasRealtimeBackups } from 'calypso/state/rewind/selectors';
import { requestRewindBackups } from 'calypso/state/rewind/backups/actions';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import QueryRewindBackups from 'calypso/components/data/query-rewind-backups';
import BackupFailed from './status-card/backup-failed';
import BackupJustCompleted from './status-card/backup-just-completed';
import BackupInProgress from './status-card/backup-in-progress';
import BackupScheduled from './status-card/backup-scheduled';
import BackupSuccessful from './status-card/backup-successful';
import NoBackupsOnSelectedDate from './status-card/no-backups-on-selected-date';
import NoBackupsYet from './status-card/no-backups-yet';

/**
 * Style dependencies
 */
import './style.scss';

const DailyBackupStatus = ( { selectedDate, lastBackupDate, backup, deltas } ) => {
	const siteId = useSelector( getSelectedSiteId );

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

	// The backup "period" property is represented by
	// an integer number of seconds since the Unix epoch
	const inProgressDate = backupPreviouslyInProgress.current
		? moment( backupPreviouslyInProgress.current.period * 1000 )
		: undefined;

	// If we're looking at today and a backup is in progress,
	// start tracking and showing progress
	if ( selectedDate.isSame( today, 'day' ) && backupCurrentlyInProgress ) {
		// Start polling the backup status endpoint every second for updates
		return (
			<>
				<Interval onTick={ refreshBackupProgress } period={ EVERY_SECOND } />
				<BackupInProgress
					percent={ backupCurrentlyInProgress.percent }
					inProgressDate={ inProgressDate }
					lastBackupDate={ lastBackupDate }
				/>
			</>
		);
	}

	// If we were previously tracking an active backup that's now
	// completed (or otherwise not running), show that it just
	// finished.
	//
	// NOTE: In the future it would be nice to switch back to the "success"
	// state and show up-to-date details immediately after a backup finishes,
	// but unfortunately there's a lag between the time a backup completes
	// and when it becomes visible through the Activity Log API.
	if ( selectedDate.isSame( today, 'day' ) && backupPreviouslyInProgress.current ) {
		return (
			<BackupJustCompleted
				justCompletedBackupDate={ inProgressDate }
				lastBackupDate={ lastBackupDate }
			/>
		);
	}

	if ( backup ) {
		const isSuccessful = hasRealtimeBackups ? isSuccessfulRealtimeBackup : isSuccessfulDailyBackup;

		return isSuccessful( backup ) ? (
			<BackupSuccessful backup={ backup } deltas={ deltas } selectedDate={ selectedDate } />
		) : (
			<BackupFailed backup={ backup } />
		);
	}

	if ( lastBackupDate ) {
		const selectedToday = selectedDate.isSame( today, 'day' );
		return selectedToday ? (
			<BackupScheduled lastBackupDate={ lastBackupDate } />
		) : (
			<NoBackupsOnSelectedDate selectedDate={ selectedDate } />
		);
	}

	return <NoBackupsYet />;
};

DailyBackupStatus.propTypes = {
	selectedDate: PropTypes.object.isRequired, // Moment object
	lastBackupDate: PropTypes.object, // Moment object
	backup: PropTypes.object,
	deltas: PropTypes.object,
};

const Wrapper = ( props ) => {
	const siteId = useSelector( getSelectedSiteId );

	// Fetch the status of the most recent backups
	// to see if there's a backup currently in progress
	return (
		<Card className="daily-backup-status">
			<QueryRewindBackups siteId={ siteId } />
			<DailyBackupStatus { ...props } />
		</Card>
	);
};

export default Wrapper;
