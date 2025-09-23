import { SiteActivityLog, ActivityLogParams, LogType } from '@automattic/api-core';
import { siteActivityLogQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { DataViews, View, Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { useActivityActions } from './actions';
import { useActivityFields } from './fields';
import { useActivityView } from './views';
import type { SiteLogsDataViewsProps } from '../../logs/dataviews';

type SiteLogsDataViewsPropsActivity = SiteLogsDataViewsProps & {
	logType: typeof LogType.ACTIVITY;
	hasActivityLogsAccess: boolean;
};
const ACTIVITY_LOGS_DEFAULT_PAGE_SIZE = 20;
function SiteActivityLogsDataViews( {
	gmtOffset,
	timezoneString,
	site,
	hasActivityLogsAccess,
}: SiteLogsDataViewsPropsActivity ) {
	const [ view, setView ] = useActivityView();

	const activityLogQueryParams: ActivityLogParams = {
		sort_order: view.sort?.direction,
		number: view.perPage || ACTIVITY_LOGS_DEFAULT_PAGE_SIZE,
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
	if ( ! hasActivityLogsAccess ) {
		paginationInfo.totalPages = 0; // this will hide the pagination controls in DataViews, an alternative to this approach would be to use Free Form composition, but that would require us to match the UI we have on the other log pages.
	}

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
			config={ hasActivityLogsAccess ? undefined : { perPageSizes: [ 20 ] } } // Disable changing perPage if no access
			search={ false }
			defaultLayouts={ { table: {} } }
			onChangeView={ onChangeView }
			empty={ <p>{ view.search ? __( 'No activity found' ) : __( 'No activities' ) }</p> }
			children={ hasActivityLogsAccess ? undefined : <DataViews.Layout /> } // showing only the layout when on the free plan.
		/>
	);
}

export default SiteActivityLogsDataViews;
