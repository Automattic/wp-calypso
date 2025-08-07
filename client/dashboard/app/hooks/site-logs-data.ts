import { useQuery } from '@tanstack/react-query';
import { LogType, PHPLog, ServerLog, FilterType } from '../../data/site-logs';
import { siteLogsQuery } from '../queries/site-logs';
import type { View } from '@wordpress/dataviews';

const EMPTY_ARRAY: ( ServerLog | PHPLog )[] = [];

const hasLogTypeChanged = ( logType: LogType, data: { logs?: ( PHPLog | ServerLog )[] } ) => {
	if (
		logType === 'php' &&
		!! data.logs &&
		data.logs.length > 0 &&
		'severity' in data.logs[ 0 ] &&
		'message' in data.logs[ 0 ]
	) {
		return false;
	}
	if (
		logType === 'server' &&
		!! data.logs &&
		data.logs.length > 0 &&
		'request_type' in data.logs[ 0 ] &&
		'status' in data.logs[ 0 ]
	) {
		return false;
	}
	return true;
};

export function useSiteLogsData( {
	siteId,
	view,
	logType,
	startTime,
	endTime,
	filter,
}: {
	siteId: number;
	view: View;
	logType: LogType;
	startTime: number;
	endTime: number;
	filter: FilterType;
} ) {
	const params: SiteLogsParams = {
		logType,
		start: startTime,
		end: endTime,
		filter,
		sortOrder: view.sort?.direction,
		pageSize: view.perPage,
		pageIndex: view.page,
	};

	const { data: siteLogs, isLoading, isFetching } = useQuery( siteLogsQuery( siteId, params ) );

	const logs =
		! siteLogs?.logs || hasLogTypeChanged( logType, siteLogs )
			? EMPTY_ARRAY
			: ( siteLogs.logs as ( PHPLog | ServerLog )[] );

	const paginationInfo = {
		totalItems: siteLogs?.total_results || 0,
		totalPages:
			!! siteLogs?.total_results && !! view.perPage
				? Math.ceil( siteLogs.total_results / view.perPage )
				: 0,
	};

	return {
		logs,
		paginationInfo,
		isLoading: isFetching,
		isInitialLoad: isLoading,
	};
}
