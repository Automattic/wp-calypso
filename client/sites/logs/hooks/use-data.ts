import {
	LogType,
	PHPLog,
	ServerLog,
	useSiteLogsQuery,
} from 'calypso/data/hosting/use-site-logs-query';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { toFilterParams } from './use-view';
import type { View } from '@wordpress/dataviews';
import type { Moment } from 'moment';

const EMPTY_ARRAY: ( ServerLog | PHPLog )[] = [];

/*
 * Providing cached data while the new data is being fetched
 * prevents table layout shifts from happening.
 *
 * However, the logs table has two schemas/fields (PHP or Web errors)
 * so when the user changes the logType, we want to refresh the cached data.
 * Otherwise, until the fresh data comes in, the table will display
 * the number of rows of the cached data but with empty fields.
 */
const hasLogTypeChanged = ( logType: LogType, data: { logs?: ( PHPLog | ServerLog )[] } ) => {
	if (
		logType === LogType.PHP &&
		!! data.logs &&
		data.logs.length > 0 &&
		'severity' in data.logs[ 0 ] &&
		'message' in data.logs[ 0 ]
	) {
		return false;
	}

	if (
		logType === LogType.WEB &&
		!! data.logs &&
		data.logs.length > 0 &&
		'request_type' in data.logs[ 0 ] &&
		'status' in data.logs[ 0 ]
	) {
		return false;
	}

	return true;
};

const useData = ( {
	view,
	logType,
	startTime,
	endTime,
}: {
	view: View;
	logType: LogType;
	startTime: Moment;
	endTime: Moment;
} ) => {
	const siteId = useSelector( getSelectedSiteId );

	const { data, isFetching, isLoading } = useSiteLogsQuery( siteId, {
		logType,
		start: startTime.unix(),
		end: endTime.unix(),
		filter: toFilterParams( { view, logType } ),
		sortOrder: view.sort?.direction,
		pageSize: view.perPage,
		pageIndex: view.page,
	} );

	return {
		data:
			! data?.logs || hasLogTypeChanged( logType, data )
				? EMPTY_ARRAY
				: ( data.logs as ( PHPLog | ServerLog )[] ),
		paginationInfo: {
			totalItems: data?.total_results || 0,
			totalPages:
				!! data?.total_results && !! view.perPage
					? Math.ceil( data.total_results / view.perPage )
					: 0,
		},
		isLoading: isFetching,
		isInitialLoad: isLoading,
	};
};

export default useData;
