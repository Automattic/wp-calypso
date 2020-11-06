/**
 * External dependencies
 */
import { isArray } from 'lodash';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getHttpData } from 'calypso/state/data-layer/http-data';
import { getRequestActivityLogsId, requestActivityLogs } from 'calypso/state/data-getters';
import getRewindCapabilities from 'calypso/state/selectors/get-rewind-capabilities';

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

export const DELTA_ACTIVITIES = [
	'attachment__uploaded',
	'attachment__deleted',
	'post__published',
	'post__trashed',
	'plugin__installed',
	'plugin__deleted',
	'theme__installed',
	'theme__deleted',
	'user__invite_accepted',
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
	const response = useSelector( () => shouldExecute && getHttpData( requestId ), [
		shouldExecute,
		requestId,
	] );

	return {
		isLoadingActivityLogs: shouldExecute && isLoading( response ),
		activityLogs: ( response?.data || [] ).sort( byActivityTsDescending ),
	};
};

export const useFirstMatchingBackupAttempt = (
	siteId,
	{ before, after, successOnly, sortOrder } = {},
	shouldExecute = true
) => {
	const rewindCapabilities = useSelector( ( state ) => getRewindCapabilities( state, siteId ) );
	const hasRealtimeBackups =
		isArray( rewindCapabilities ) && rewindCapabilities.includes( 'backup-realtime' );

	const backupAttemptActivities = [
		...( hasRealtimeBackups ? DELTA_ACTIVITIES : [] ),
		...( successOnly ? SUCCESSFUL_BACKUP_ACTIVITIES : BACKUP_ATTEMPT_ACTIVITIES ),
	];

	const filter = {
		name: backupAttemptActivities,
		before: before ? before.toISOString() : undefined,
		after: after ? after.toISOString() : undefined,
		aggregate: false,
		number: 1,
		sortOrder,
	};

	const { activityLogs, isLoadingActivityLogs } = useActivityLogs( siteId, filter, shouldExecute );
	return {
		isLoading: isLoadingActivityLogs,
		backupAttempt: activityLogs[ 0 ] || undefined,
	};
};
