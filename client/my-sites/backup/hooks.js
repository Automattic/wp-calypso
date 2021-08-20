import { isEnabled } from '@automattic/calypso-config';
import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { getRequestActivityLogsId, requestActivityLogs } from 'calypso/state/data-getters';
import { getHttpData } from 'calypso/state/data-layer/http-data';
import { requestRewindCapabilities } from 'calypso/state/rewind/capabilities/actions';
import getActivityLogVisibleDays from 'calypso/state/selectors/get-activity-log-visible-days';
import getRewindCapabilities from 'calypso/state/selectors/get-rewind-capabilities';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';

const isLoading = ( response ) => [ 'uninitialized', 'pending' ].includes( response.state );

const byActivityTsDescending = ( a, b ) => ( a.activityTs > b.activityTs ? -1 : 1 );

export const SUCCESSFUL_BACKUP_ACTIVITIES = [
	'rewind__backup_complete_full',
	'rewind__backup_complete_initial',
	'rewind__backup_only_complete_full',
	'rewind__backup_only_complete_initial',
];

export const BACKUP_ATTEMPT_ACTIVITIES = [
	...SUCCESSFUL_BACKUP_ACTIVITIES,
	'rewind__backup_error',
];

const useMemoizeFilter = ( filter ) => {
	const filterRef = useRef();

	const refRequestId = filterRef.current && getRequestActivityLogsId( null, filterRef.current );
	const inputRequestId = filter && getRequestActivityLogsId( null, filter );

	if ( inputRequestId !== refRequestId ) {
		filterRef.current = filter;
	}

	return filterRef.current;
};

export const useActivityLogs = ( siteId, filter, shouldExecute = true ) => {
	const memoizedFilter = useMemoizeFilter( filter );

	useEffect( () => {
		shouldExecute && requestActivityLogs( siteId, memoizedFilter );
	}, [ shouldExecute, siteId, memoizedFilter ] );

	const requestId = getRequestActivityLogsId( siteId, memoizedFilter );
	const response = useSelector( () => shouldExecute && getHttpData( requestId ) );

	return {
		isLoadingActivityLogs: !! ( shouldExecute && isLoading( response ) ),
		activityLogs: ( response?.data || [] ).sort( byActivityTsDescending ),
	};
};

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

export const useFirstMatchingBackupAttempt = (
	siteId,
	{ before, after, successOnly, sortOrder } = {},
	shouldExecute = true
) => {
	useEffect( () => {
		requestRewindCapabilities( siteId );
	}, [ siteId ] );

	const rewindCapabilities = useSelector( ( state ) => getRewindCapabilities( state, siteId ) );
	const hasRealtimeBackups =
		Array.isArray( rewindCapabilities ) && rewindCapabilities.includes( 'backup-realtime' );

	const filter = hasRealtimeBackups
		? getRealtimeAttemptFilter( { before, after, sortOrder } )
		: getDailyAttemptFilter( { before, after, successOnly, sortOrder } );

	const { activityLogs, isLoadingActivityLogs } = useActivityLogs(
		siteId,
		filter,
		!! shouldExecute
	);

	if ( ! shouldExecute ) {
		return {
			isLoading: false,
			backupAttempt: undefined,
		};
	}

	if ( isLoadingActivityLogs ) {
		return {
			isLoading: true,
			backupAttempt: undefined,
		};
	}

	// Daily backups are a much simpler case than real-time;
	// let's get them out of the way before handling the more
	// complex stuff
	if ( ! hasRealtimeBackups ) {
		return {
			isLoading: false,
			backupAttempt: activityLogs[ 0 ] || undefined,
		};
	}

	// For real-time backups (for now), the most reliable way to find the first
	// backup event in a list is by getting a large list and filtering by
	// `activityIsRewindable`. This may change soon, with the introduction of an
	// API endpoint to fetch all backup points in a given date range.
	const matchingAttempt = activityLogs
		// Sort in descending order by default, but flip if sortOrder is
		// explicitly set to 'asc'
		.sort( ( a, b ) => byActivityTsDescending( a, b ) * ( sortOrder === 'asc' ? -1 : 1 ) )
		.filter( ( { activityIsRewindable } ) => activityIsRewindable )[ 0 ];

	return {
		isLoading: isLoadingActivityLogs,
		backupAttempt: matchingAttempt || undefined,
	};
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
			if ( ! isEnabled( 'activity-log/display-rules' ) ) {
				return true;
			}

			if ( visibleDays === undefined ) {
				return true;
			}

			const today = applySiteOffset( Date.now(), { gmtOffset, timezone } ).startOf( 'day' );
			return today.diff( date, 'days' ) <= visibleDays;
		},
		[ gmtOffset, timezone, visibleDays ]
	);
};
