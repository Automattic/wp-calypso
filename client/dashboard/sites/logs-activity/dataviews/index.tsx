import { SiteActivityLog, ActivityLogParams, LogType } from '@automattic/api-core';
import { siteActivityLogQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { DataViews, View, Field } from '@wordpress/dataviews';
import { useMemo } from 'react';
import { useActivityActions } from './actions';
import { useActivityFields } from './fields';
import { useActivityView } from './views';
import type { SiteLogsDataViewsProps } from '../../logs/dataviews';

function SiteActivityLogsDataViews( {
	gmtOffset,
	timezoneString,
	site,
}: SiteLogsDataViewsProps & {
	logType: typeof LogType.ACTIVITY;
} ) {
	const [ view, setView ] = useActivityView();

	const activityLogQueryParams: ActivityLogParams = {
		sort_order: view.sort?.direction,
		number: view.perPage || 20,
		page: view.page,
	};

	const { data: activityLogData, isFetching } = useQuery(
		siteActivityLogQuery( site.ID, activityLogQueryParams )
	);

	const logs = useMemo( () => {
		const suffix = `p${ view.page }`;

		const items = activityLogData?.activityLogs ?? [];
		return items.map( ( activity: SiteActivityLog, index: number ) => ( {
			...activity,
			id: `${ activity.activity_id }|${ suffix }|${ String( index ) }`,
		} ) );
	}, [ activityLogData?.activityLogs, view.page ] );

	const paginationInfo = {
		totalItems: activityLogData?.totalItems ?? 0,
		totalPages: activityLogData?.totalPages ?? 0,
	};

	const fields = useActivityFields(
		timezoneString ? { gmtOffset, timezoneString } : { gmtOffset }
	);

	const actions = useActivityActions( { isLoading: isFetching } );

	const onChangeView = ( next: View ) => {
		setView( {
			...next,
			filters: [],
		} );
	};

	return (
		<DataViews< SiteActivityLog >
			data={ logs }
			isLoading={ isFetching }
			paginationInfo={ paginationInfo }
			fields={ fields as Field< SiteActivityLog >[] }
			view={ view }
			actions={ actions }
			search={ false }
			defaultLayouts={ { table: {} } }
			onChangeView={ onChangeView }
		/>
	);
}

export default SiteActivityLogsDataViews;
