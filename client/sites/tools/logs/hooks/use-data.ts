import {
	LogType,
	PHPLog,
	ServerLog,
	useSiteLogsQuery,
} from 'calypso/data/hosting/use-site-logs-query';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { buildFilter, getFilterValue } from './use-view';
import type { View } from '@wordpress/dataviews';
import type { Moment } from 'moment';

const EMPTY_ARRAY: ( ServerLog | PHPLog )[] = [];

const useData = ( {
	view,
	logType,
	dateFrom,
	dateTo,
}: {
	view: View;
	logType: LogType;
	dateFrom: Moment;
	dateTo: Moment;
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const severity = getFilterValue( view, 'severity' );
	const status = getFilterValue( view, 'status' );
	const requestType = getFilterValue( view, 'request_type' );

	const { data, isFetching } = useSiteLogsQuery( siteId, {
		logType,
		start: dateFrom.unix(),
		end: dateTo.unix(),
		filter: buildFilter( logType, severity, requestType, status ),
		sortOrder: view.sort?.direction,
		pageSize: view.perPage,
		pageIndex: view.page,
	} );

	return {
		data: data?.logs ? ( data.logs as ( PHPLog | ServerLog )[] ) : EMPTY_ARRAY,
		paginationInfo: {
			totalItems: data?.total_results || 0,
			totalPages:
				!! data?.total_results && !! view.perPage
					? Math.ceil( data.total_results / view.perPage )
					: 0,
		},
		isLoading: isFetching,
	};
};

export default useData;
