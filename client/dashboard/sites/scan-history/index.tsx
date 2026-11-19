import { siteScanHistoryQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { usePersistentView } from '../../app/hooks/use-persistent-view';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import { siteScanHistoryRoute } from '../../app/router/sites';
import { Card, CardBody } from '../../components/card';
import { DataViews, DataViewsEmptyStateLayout } from '../../components/dataviews';
import { getNoMatchingThreats } from '../scan/no-matching-threats';
import { getActions } from './dataviews/actions';
import { getFields } from './dataviews/fields';
import type { Threat, Site } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

interface ScanHistoryDataViewsProps {
	site: Site;
	timezoneString?: string;
	gmtOffset?: number;
}

const defaultView: View = {
	type: 'table',
	fields: [ 'status', 'fixed_on', 'threat', 'severity' ],
	perPage: 10,
	sort: {
		field: 'fixed_on',
		direction: 'desc',
	},
	layout: {
		density: 'balanced',
		styles: {
			status: {
				maxWidth: '100px',
			},
			threat: {
				minWidth: '500px',
			},
			fixed_on: {
				maxWidth: '175px',
				minWidth: '160px',
			},
		},
	},
	showLevels: false,
};

export function ScanHistoryDataViews( {
	site,
	timezoneString,
	gmtOffset,
}: ScanHistoryDataViewsProps ) {
	const { data: scanHistory, isLoading } = useQuery( siteScanHistoryQuery( site.ID ) );
	const threats = scanHistory?.threats || [];

	const searchParams = siteScanHistoryRoute.useSearch();
	const { view, updateView, resetView } = usePersistentView( {
		slug: 'site-scan-history',
		defaultView,
		queryParams: searchParams,
	} );
	const fields = getFields( timezoneString, gmtOffset );
	const actions = getActions( site );
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( threats, view, fields );

	const hasFilters = ( view.filters?.length ?? 0 ) > 0;
	// Known data stays known when a later refetch fails.
	const hasLoaded = scanHistory !== undefined;

	// Nothing to search or filter: the empty state takes the place of the list.
	if ( hasLoaded && threats.length === 0 && ! view.search && ! hasFilters ) {
		return (
			<>
				<PerformanceTrackerStop />
				<DataViewsEmptyStateLayout
					title={ __( 'No history yet' ) }
					description={ __( 'Fixed and ignored threats will appear here.' ) }
				/>
			</>
		);
	}

	return (
		<Card>
			<CardBody>
				{ ! isLoading && <PerformanceTrackerStop /> }
				<DataViews< Threat >
					actions={ actions }
					data={ filteredData }
					defaultLayouts={ { table: {} } }
					// A failed first request says nothing about the history: keep the default message.
					empty={ hasLoaded ? getNoMatchingThreats( view.search, hasFilters ) : undefined }
					fields={ fields }
					getItemId={ ( item ) => item.id.toString() }
					isLoading={ isLoading }
					onChangeView={ updateView }
					onReset={ resetView }
					paginationInfo={ paginationInfo }
					searchLabel={ __( 'Search' ) }
					view={ view }
				/>
			</CardBody>
		</Card>
	);
}
