import { WPCOM_FEATURES_REAL_TIME_BACKUPS } from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import useRewindableActivityLogQuery from 'calypso/data/activity-log/use-rewindable-activity-log-query';
import {
	SUCCESSFUL_BACKUP_ACTIVITIES,
	BACKUP_ATTEMPT_ACTIVITIES,
} from 'calypso/lib/jetpack/backup-utils';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';

const byActivityTsDescending = ( a, b ) => ( a.activityTs > b.activityTs ? -1 : 1 );

const getDailyAttemptFilter = ( { before, after, successOnly, sortOrder } = {} ) => {
	return {
		name: successOnly ? SUCCESSFUL_BACKUP_ACTIVITIES : BACKUP_ATTEMPT_ACTIVITIES,
		before: before ? before.toISOString() : undefined,
		after: after ? after.toISOString() : undefined,
		aggregate: false,
		number: 1,
		sortOrder,
	};
};

// Get all successful backups in a range
const getSuccessfulBackupsFilter = ( { before, after, sortOrder } = {} ) => {
	return {
		name: SUCCESSFUL_BACKUP_ACTIVITIES,
		before: before ? before.toISOString() : undefined,
		after: after ? after.toISOString() : undefined,
		aggregate: false,
		number: 500,
		sortOrder,
	};
};

// For more context, see the note on real-time backups in
// `useFirstMatchingBackupAttempt`
const getRealtimeAttemptFilter = ( { before, after, sortOrder } = {} ) => {
	return {
		before: before ? before.toISOString() : undefined,
		after: after ? after.toISOString() : undefined,
		aggregate: false,
		number: 100,
		sortOrder,
	};
};

// Find all the backup attempts in a given date range
export const useMatchingBackupAttemptsInRange = ( siteId, { before, after, sortOrder } = {} ) => {
	const filter = getSuccessfulBackupsFilter( { before, after, sortOrder } );
	const { data: backups, isLoading } = useRewindableActivityLogQuery( siteId, filter );

	return { isLoading, backups };
};

export const useFirstMatchingBackupAttempt = (
	siteId,
	{ before, after, successOnly, sortOrder } = {},
	queryOptions = {}
) => {
	const hasRealtimeBackups = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_REAL_TIME_BACKUPS )
	);

	const filter = hasRealtimeBackups
		? getRealtimeAttemptFilter( { before, after, sortOrder } )
		: getDailyAttemptFilter( { before, after, successOnly, sortOrder } );

	const { data, isLoading, refetch } = useRewindableActivityLogQuery(
		siteId,
		filter,
		queryOptions
	);

	let backupAttempt = undefined;
	if ( data ) {
		// Daily backups are a much simpler case than real-time;
		// let's get them out of the way before handling the more
		// complex stuff
		if ( ! hasRealtimeBackups ) {
			backupAttempt = data[ 0 ];
		} else {
			// For real-time backups (for now), the most reliable way to find the first
			// backup event in a list is by getting a large list and filtering by
			// `activityIsRewindable`. This may change soon, with the introduction of an
			// API endpoint to fetch all backup points in a given date range.
			backupAttempt = data
				// Sort in descending order by default, but flip if sortOrder is
				// explicitly set to 'asc'
				.sort( ( a, b ) => byActivityTsDescending( a, b ) * ( sortOrder === 'asc' ? -1 : 1 ) )
				.find( ( a ) => {
					// Only the successful backups should be returned, then activity should be rewindable
					if ( successOnly ) {
						return a.activityIsRewindable;
					}
					return BACKUP_ATTEMPT_ACTIVITIES.includes( a.activityName );
				} );
		}
	}

	return { isLoading, backupAttempt, refetch };
};
