import { SiteActivityLog, ActivityLogParams, LogType } from '@automattic/api-core';
import { siteActivityLogQuery, siteActivityLogGroupCountsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { DataViews, View, Field, Filter } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useEffect } from 'react';
import { filtersSignature } from '../../logs/dataviews/filters';
import { syncFiltersSearchParams } from '../../logs/dataviews/url-sync';
import { buildTimeRangeInSeconds } from '../../logs/utils';
import { useActivityActions } from './actions';
import { useActivityFields } from './fields';
import {
	extractActivityLogTypeValues,
	sanitizeFilters,
	ALLOWED_FILTER_FIELDS,
	getInitialFiltersFromSearch,
	getInitialSearchTermFromSearch,
} from './filters';
import { useActivityView } from './views';
import type { SiteLogsDataViewsProps } from '../../logs/dataviews';

import './style.scss';

function SiteActivityLogsDataViews( {
	gmtOffset,
	timezoneString,
	site,
	dateRange,
	dateRangeVersion,
}: SiteLogsDataViewsProps & {
	logType: typeof LogType.ACTIVITY;
} ) {
	const router = useRouter();
	const locationSearch = router.state.location.search;
	const [ view, setView ] = useActivityView( {
		initialFilters: sanitizeFilters( getInitialFiltersFromSearch( locationSearch ) ),
		initialSearch: getInitialSearchTermFromSearch( locationSearch ),
	} );

	// buildTimeRangeInSeconds applies the proper timezone offset and normalizes to full-day bounds.
	const { startSec, endSec } = useMemo(
		() => buildTimeRangeInSeconds( dateRange.start, dateRange.end, timezoneString, gmtOffset ),
		[ dateRange.start, dateRange.end, gmtOffset, timezoneString ]
	);

	// Convert to ISO strings since that's what the API expects.
	const afterIso = new Date( startSec * 1000 ).toISOString();
	const beforeIso = new Date( endSec * 1000 ).toISOString();

	const activityLogTypeValues = useMemo( () => {
		const filters = ( view.filters as Filter[] | undefined ) ?? [];
		return extractActivityLogTypeValues( filters );
	}, [ view.filters ] );

	const searchTerm = view.search?.trim() ?? '';

	const activityLogQueryParams: ActivityLogParams = {
		sort_order: view.sort?.direction,
		number: view.perPage || 20,
		page: view.page,
		after: afterIso,
		before: beforeIso,
	};

	if ( searchTerm ) {
		activityLogQueryParams.text_search = searchTerm;
	}
	if ( activityLogTypeValues.length ) {
		activityLogQueryParams.group = activityLogTypeValues;
	}

	const { data: activityLogData, isFetching: isFetchingData } = useQuery(
		siteActivityLogQuery( site.ID, activityLogQueryParams )
	);

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
		} )
	);
	const isFetching = isFetchingData || isFetchingFilters;

	const logs = useMemo( () => {
		const currentPage = view.page ?? 1;
		const suffix = `p${ currentPage }`;
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
		timezoneString
			? { gmtOffset, timezoneString, activityLogTypes: groupCountsData?.groups }
			: { gmtOffset, activityLogTypes: groupCountsData?.groups }
	);

	const actions = useActivityActions( { isLoading: isFetching } );

	const onChangeView = ( next: View ) => {
		const nextFilters = sanitizeFilters( next.filters as Filter[] | undefined );
		const nextSearch = next.search?.trim() ?? '';
		const nextSearchValue = nextSearch.length > 0 ? nextSearch : undefined;

		const currentPage = view.page ?? 1;
		const requestedPage = next.page ?? currentPage;

		const perPageChanged = next.perPage !== view.perPage;
		const sortChanged = next.sort?.direction !== view.sort?.direction;
		const filtersChanged =
			filtersSignature( nextFilters, ALLOWED_FILTER_FIELDS ) !==
			filtersSignature( view.filters, ALLOWED_FILTER_FIELDS );

		const searchChanged = nextSearch !== searchTerm;

		const datasetChanged = perPageChanged || sortChanged || filtersChanged || searchChanged;

		const url = new URL( window.location.href );
		syncFiltersSearchParams( url.searchParams, ALLOWED_FILTER_FIELDS, nextFilters );
		if ( nextSearchValue ) {
			url.searchParams.set( 'search', nextSearchValue );
		} else {
			url.searchParams.delete( 'search' );
		}
		window.history.replaceState( null, '', url.pathname + url.search );

		setView( {
			...next,
			page: datasetChanged ? 1 : requestedPage,
			filters: nextFilters,
			search: nextSearchValue,
		} );
	};

	// Reset pagination when the date range changes
	useEffect( () => {
		setView( ( next ) => ( { ...next, page: 1 } ) );
	}, [ dateRangeVersion, setView ] );

	return (
		<DataViews< SiteActivityLog >
			data={ logs }
			isLoading={ isFetching }
			paginationInfo={ paginationInfo }
			fields={ fields as Field< SiteActivityLog >[] }
			view={ view }
			actions={ actions }
			search
			searchLabel={ __( 'Search posts by ID, title or author' ) }
			defaultLayouts={ { table: {} } }
			onChangeView={ onChangeView }
		/>
	);
}

export default SiteActivityLogsDataViews;
