import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useActivityLogQuery from 'calypso/data/activity-log/use-activity-log-query';
import {
	SUCCESSFUL_BACKUP_ACTIVITIES,
	BACKUP_ATTEMPT_ACTIVITIES,
} from 'calypso/lib/jetpack/backup-utils';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { requestRewindCapabilities } from 'calypso/state/rewind/capabilities/actions';
import getActivityLogVisibleDays from 'calypso/state/rewind/selectors/get-activity-log-visible-days';
import getRewindCapabilities from 'calypso/state/selectors/get-rewind-capabilities';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';

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
	const { data: backups, isLoading } = useActivityLogQuery( siteId, filter );

	return { isLoading, backups };
};

export const useFirstMatchingBackupAttempt = (
	siteId,
	{ before, after, successOnly, sortOrder } = {}
) => {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestRewindCapabilities( siteId ) );
	}, [ siteId ] );

	const rewindCapabilities = useSelector( ( state ) => getRewindCapabilities( state, siteId ) );
	const hasRealtimeBackups =
		Array.isArray( rewindCapabilities ) && rewindCapabilities.includes( 'backup-realtime' );

	const filter = hasRealtimeBackups
		? getRealtimeAttemptFilter( { before, after, sortOrder } )
		: getDailyAttemptFilter( { before, after, successOnly, sortOrder } );

	const { data, isLoading } = useActivityLogQuery( siteId, filter );

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

	return { isLoading, backupAttempt };
};

/**
 * A React hook that creates a callback to test whether or not a given date
 * should be visible in the Backup UI (if display rules are enabled).
 *
 * @param {number|null} siteId The site whose display rules we'll be testing against.
 * @returns A callback that returns true if a given date should be visible, and false otherwise.
 */
export const useIsDateVisible = ( siteId ) => {
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const visibleDays = useSelector( ( state ) => getActivityLogVisibleDays( state, siteId ) );

	return useCallback(
		( date ) => {
			if ( visibleDays === undefined ) {
				return true;
			}

			const today = applySiteOffset( Date.now(), { gmtOffset, timezone } ).startOf( 'day' );
			return today.diff( date, 'days' ) <= visibleDays;
		},
		[ gmtOffset, timezone, visibleDays ]
	);
};
