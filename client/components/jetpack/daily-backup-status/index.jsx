import { WPCOM_FEATURES_REAL_TIME_BACKUPS } from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QueryRewindBackups from 'calypso/components/data/query-rewind-backups';
import QueryRewindPolicies from 'calypso/components/data/query-rewind-policies';
import BackupWarnings from 'calypso/components/jetpack/backup-warnings/backup-warnings';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { Interval, EVERY_SECOND } from 'calypso/lib/interval';
import {
	MINUTE_IN_MS,
	isSuccessfulDailyBackup,
	isSuccessfulRealtimeBackup,
	isStorageOrRetentionReached,
	getBackupErrorCode,
} from 'calypso/lib/jetpack/backup-utils';
import useDateWithOffset from 'calypso/lib/jetpack/hooks/use-date-with-offset';
import { requestRewindBackups } from 'calypso/state/rewind/backups/actions';
import {
	getInProgressBackupForSite,
	getRewindStorageUsageLevel,
	getFinishedBackupForSiteById,
} from 'calypso/state/rewind/selectors';
import { StorageUsageLevels } from 'calypso/state/rewind/storage/types';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import BackupFailed from './status-card/backup-failed';
import BackupInProgress from './status-card/backup-in-progress';
import BackupJustCompleted from './status-card/backup-just-completed';
import BackupNoStorage from './status-card/backup-no-storage';
import BackupScheduled from './status-card/backup-scheduled';
import BackupSuccessful from './status-card/backup-successful';
import NoBackupsOnSelectedDate from './status-card/no-backups-on-selected-date';
import NoBackupsYet from './status-card/no-backups-yet';

import './style.scss';

const DailyBackupStatus = ( {
	selectedDate,
	lastBackupAttempt,
	lastBackupAttemptOnDate,
	lastBackupDate,
	backup,
	deltas,
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const usageLevel = useSelector( ( state ) => getRewindStorageUsageLevel( state, siteId ) );

	const moment = useLocalizedMoment();
	const today = useDateWithOffset( moment() );

	const dispatch = useDispatch();
	const refreshBackupProgress = useCallback(
		() => dispatch( requestRewindBackups( siteId ) ),
		[ dispatch, siteId ]
	);

	const hasRealtimeBackups = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_REAL_TIME_BACKUPS )
	);

	const [ backupPreviouslyInProgress, setBackupPreviouslyInProgress ] = useState( null );
	const backupCurrentlyInProgress = useSelector( ( state ) => {
		const inProgressBackup = getInProgressBackupForSite( state, siteId );

		if ( inProgressBackup && ! backupPreviouslyInProgress ) {
			setBackupPreviouslyInProgress( inProgressBackup );
		}
		return inProgressBackup;
	} );

	// Using the id from backupPreviouslyInProgress get the backup if it finished successfully.
	const backupFinishedSuccessfully = useSelector( ( state ) => {
		if ( backupPreviouslyInProgress ) {
			const backupFinished = getFinishedBackupForSiteById(
				state,
				siteId,
				backupPreviouslyInProgress.id
			);

			if ( backupFinished ) {
				setTimeout( () => {
					setBackupPreviouslyInProgress( null );
				}, MINUTE_IN_MS );
			}

			return backupFinished;
		}
		return null;
	} );

	// The backup "period" property is represented by
	// an integer number of seconds since the Unix epoch
	const inProgressDate = backupPreviouslyInProgress
		? moment( backupPreviouslyInProgress.period * 1000 )
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
	if ( selectedDate.isSame( today, 'day' ) && backupPreviouslyInProgress ) {
		if ( backupFinishedSuccessfully ) {
			return (
				<BackupJustCompleted
					justCompletedBackupDate={ inProgressDate }
					lastBackupDate={ lastBackupDate }
				/>
			);
		}
		// There was a backup in progress, but it failed.
		return <BackupFailed backup={ { activityTs: Date.now() } } />;
	}

	if ( backup ) {
		const isSuccessful = hasRealtimeBackups ? isSuccessfulRealtimeBackup : isSuccessfulDailyBackup;

		if ( isSuccessful( backup ) ) {
			return (
				<BackupSuccessful
					backup={ backup }
					deltas={ deltas }
					selectedDate={ selectedDate }
					lastBackupAttemptOnDate={ lastBackupAttemptOnDate }
					availableActions={ [ 'rewind' ] }
				/>
			);
		} else if ( isStorageOrRetentionReached( backup ) ) {
			return <BackupNoStorage selectedDate={ selectedDate } />;
		}
		return <BackupFailed backup={ backup } />;
	}
	if ( lastBackupDate ) {
		// if the storage is full, don't show backup is schdeuled or delayed message to the user.
		if ( StorageUsageLevels.Full === usageLevel ) {
			return null;
		}
		const selectedToday = selectedDate.isSame( today, 'day' );
		return selectedToday ? (
			<BackupScheduled lastBackupDate={ lastBackupDate } />
		) : (
			<NoBackupsOnSelectedDate selectedDate={ selectedDate } />
		);
	}

	if ( getBackupErrorCode( lastBackupAttempt ) === 'NOT_ACCESSIBLE' ) {
		return <BackupFailed backup={ lastBackupAttempt } />;
	}

	return <NoBackupsYet />;
};

DailyBackupStatus.propTypes = {
	selectedDate: PropTypes.object.isRequired, // Moment object
	lastBackupDate: PropTypes.object, // Moment object
	lastBackupAttemptOnDate: PropTypes.object, // Moment object
	backup: PropTypes.object,
	deltas: PropTypes.object,
};

const Wrapper = ( props ) => {
	const siteId = useSelector( getSelectedSiteId );

	// Fetch the status of the most recent backups
	// to see if there's a backup currently in progress
	return (
		<>
			<Card className="daily-backup-status">
				<QueryRewindPolicies siteId={ siteId } />
				<QueryRewindBackups siteId={ siteId } />
				<DailyBackupStatus { ...props } />
			</Card>
			<BackupWarnings lastBackupAttemptOnDate={ props.lastBackupAttemptOnDate } />
		</>
	);
};

export default Wrapper;
