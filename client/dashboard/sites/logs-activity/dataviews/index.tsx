import { ActivityLogParams, LogType } from '@automattic/api-core';
import { siteActivityLogQuery, siteActivityLogGroupCountsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { View, Field, Filter } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import fastDeepEqual from 'fast-deep-equal/es6';
import { useMemo, useEffect } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { usePersistentView } from '../../../app/hooks/use-persistent-view';
import { siteLogsActivityRoute } from '../../../app/router/sites';
import { DataViews } from '../../../components/dataviews';
import { getActivityLogHiddenGroups } from '../../../utils/site-features';
import { buildTimeRangeInSeconds } from '../../logs/utils';
import { ActivityLogsCallout } from '../activity-logs-callout';
import { transformActivityLogEntry } from '../activity-transformer';
import { useActivityActions } from './actions';
import { useActivityFields } from './fields';
import { extractActivityLogTypeValues } from './filters';
import { DEFAULT_VIEW } from './views';
import type { Activity } from '../../../components/logs-activity/types';
import type { SiteLogsDataViewsProps } from '../../logs/dataviews';
import './style.scss';

type SiteLogsDataViewsPropsActivity = SiteLogsDataViewsProps & {
	logType: typeof LogType.ACTIVITY;
	hasActivityLogsAccess: boolean;
};

const ACTIVITY_LOGS_DEFAULT_PAGE_SIZE = 20;
function SiteActivityLogsDataViews( {
	gmtOffset,
	timezoneString,
	site,
	dateRange,
	dateRangeVersion,
	hasActivityLogsAccess,
}: SiteLogsDataViewsPropsActivity ) {
	const { recordTracksEvent } = useAnalytics();

	const { startSec, endSec } = useMemo(
		() => buildTimeRangeInSeconds( dateRange.start, dateRange.end, timezoneString, gmtOffset ),
		[ dateRange.start, dateRange.end, gmtOffset, timezoneString ]
	);

	const searchParams = siteLogsActivityRoute.useSearch();

	const { view, updateView, resetView } = usePersistentView( {
		slug: 'site-logs-activity',
		defaultView: DEFAULT_VIEW,
		queryParams: searchParams,
	} );

	// Convert to ISO strings since that's what the API expects.
	const afterIso = new Date( startSec * 1000 ).toISOString();
	const beforeIso = new Date( endSec * 1000 ).toISOString();

	const activityLogTypeValues = useMemo( () => {
		const filters = ( view.filters as Filter[] | undefined ) ?? [];
		return extractActivityLogTypeValues( filters );
	}, [ view.filters ] );

	const searchTerm = view.search?.trim() ?? '';

	const notGroup = getActivityLogHiddenGroups( site );

	const activityLogQueryParams: ActivityLogParams = {
		sort_order: view.sort?.direction,
		number: view.perPage || ACTIVITY_LOGS_DEFAULT_PAGE_SIZE,
		page: view.page,
		after: afterIso,
		before: beforeIso,
		...( notGroup?.length && { not_group: notGroup } ),
	};

	if ( searchTerm ) {
		activityLogQueryParams.text_search = searchTerm;
	}
	if ( activityLogTypeValues.length ) {
		activityLogQueryParams.group = activityLogTypeValues;
	}

	const { data: activityLogData, isFetching: isFetchingData } = useQuery( {
		...siteActivityLogQuery( site.ID, activityLogQueryParams ),
		select: ( data ) => {
			// use the transformer to ensure the data is always in the expected format
			return {
				...data,
				activityLogs: data.activityLogs?.map( transformActivityLogEntry ),
			};
		},
	} );

	/**
	 * We're not passing the extra params, like text_search, to the query because that would make the group changes and
	 * we would lose the selected filters descriptions in the UI.
	 * The downside of this is that the counts might not be 100% accurate when a search term is applied.
	 */
	const { data: groupCountsData, isFetching: isFetchingFilters } = useQuery(
		siteActivityLogGroupCountsQuery( site.ID, {
			after: afterIso,
			before: beforeIso,
			number: 1000,
			...( notGroup?.length && { not_group: notGroup } ),
		} )
	);
	const isFetching = isFetchingData || isFetchingFilters;

	const paginationInfo = {
		totalItems: activityLogData?.totalItems ?? 0,
		totalPages: activityLogData?.totalPages ?? 0,
	};
	if ( ! hasActivityLogsAccess ) {
		paginationInfo.totalPages = 0; // this will hide the pagination controls in DataViews, an alternative to this approach would be to use Free Form composition, but that would require us to match the UI we have on the other log pages.
	}

	const fields = useActivityFields(
		timezoneString
			? { gmtOffset, timezoneString, activityLogTypes: groupCountsData?.groups }
			: { gmtOffset, activityLogTypes: groupCountsData?.groups }
	);

	const actions = useActivityActions( { isLoading: isFetching, site } );

	const onChangeView = ( next: View ) => {
		const nextFilters = next.filters;
		const nextSearch = next.search?.trim() ?? '';

		const currentPage = view.page ?? 1;
		const requestedPage = next.page ?? currentPage;

		const perPageChanged = next.perPage !== view.perPage;
		const sortChanged = next.sort?.direction !== view.sort?.direction;
		const filtersChanged = ! fastDeepEqual( nextFilters, view.filters );

		const searchChanged = nextSearch !== searchTerm;

		const datasetChanged = perPageChanged || sortChanged || filtersChanged || searchChanged;

		if ( perPageChanged ) {
			recordTracksEvent( 'calypso_dashboard_sites_logs_activity_per_page_changed', {
				per_page: next.perPage,
			} );
		}
		if ( filtersChanged ) {
			const activityTypes = extractActivityLogTypeValues( nextFilters ?? [] );
			const eventProps: Record< string, boolean | number > = {
				num_groups_selected: activityTypes.length,
			};
			let totalActivitiesSelected = 0;
			Object.entries( groupCountsData?.groups ?? {} ).forEach( ( [ groupKey, { count } ] ) => {
				const isSelected = activityTypes.includes( groupKey );
				eventProps[ `group_${ groupKey }` ] = isSelected;
				if ( isSelected ) {
					totalActivitiesSelected += count ?? 0;
				}
			} );
			eventProps.num_total_activities_selected = totalActivitiesSelected;
			recordTracksEvent( 'calypso_dashboard_sites_logs_activity_filter_changed', eventProps );
		}
		if ( searchChanged ) {
			recordTracksEvent( 'calypso_dashboard_sites_logs_activity_search', {
				has_query: nextSearch.length > 0,
			} );
		}
		if ( ! datasetChanged && requestedPage !== currentPage ) {
			recordTracksEvent( 'calypso_dashboard_sites_logs_activity_page_changed', {
				page: requestedPage,
			} );
		}
		updateView( {
			...next,
			page: datasetChanged ? 1 : requestedPage,
		} );
	};

	// Reset pagination when the date range changes
	useEffect( () => {
		updateView( { ...view, page: 1 } );
		// eslint-disable-next-line react-hooks/exhaustive-deps -- reset page only when dateRange changes
	}, [ dateRangeVersion ] );

	const logData = activityLogData?.activityLogs || [];
	return (
		<>
			<DataViews< Activity >
				data={ logData }
				isLoading={ isFetching }
				paginationInfo={ paginationInfo }
				fields={ fields as Field< Activity >[] }
				view={ view }
				actions={ actions }
				getItemId={ ( item ) => item.activityId.toString() }
				config={
					hasActivityLogsAccess ? undefined : { perPageSizes: [ ACTIVITY_LOGS_DEFAULT_PAGE_SIZE ] }
				} // Disable changing perPage if no access
				search
				defaultLayouts={ { table: {} } }
				onChangeView={ onChangeView }
				onResetView={ resetView }
				empty={ <p>{ view.search ? __( 'No activity found' ) : __( 'No activities' ) }</p> }
				children={ hasActivityLogsAccess ? undefined : <DataViews.Layout /> } // showing only the layout when on the free plan.
			/>

			{ ! hasActivityLogsAccess && ! isFetching && logData.length > 0 && (
				<HStack alignment="center" className="site-logs-card--activity-callout">
					<div className="site-logs-card--activity-callout-content">
						<ActivityLogsCallout siteSlug={ site.slug } />
					</div>
				</HStack>
			) }
		</>
	);
}

export default SiteActivityLogsDataViews;
