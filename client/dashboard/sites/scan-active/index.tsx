import { siteScanQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { usePersistentView } from '../../app/hooks/use-persistent-view';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import { siteScanActiveThreatsRoute } from '../../app/router/sites';
import { Card, CardBody } from '../../components/card';
import { DataViews, DataViewsEmptyStateLayout } from '../../components/dataviews';
import { getNoMatchingThreats } from '../scan/no-matching-threats';
import { getActions } from './dataviews/actions';
import { getFields } from './dataviews/fields';
import type { Threat, Site } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

interface ActiveThreatsDataViewsProps {
	site: Site;
	timezoneString?: string;
	gmtOffset?: number;
}

const defaultView: View = {
	type: 'table',
	fields: [ 'severity', 'threat', 'first_detected', 'auto_fix' ],
	perPage: 10,
	sort: {
		field: 'severity',
		direction: 'desc',
	},
	layout: {
		density: 'balanced',
		styles: {
			threat: {
				minWidth: '500px',
			},
			first_detected: {
				maxWidth: '175px',
				minWidth: '140px',
			},
		},
	},
	showLevels: false,
};

export function ActiveThreatsDataViews( {
	site,
	timezoneString,
	gmtOffset,
}: ActiveThreatsDataViewsProps ) {
	const [ selection, setSelection ] = useState< string[] >( [] );
	const { data: scan, isLoading } = useQuery( siteScanQuery( site.ID ) );
	const threats = scan?.threats?.filter( ( threat ) => threat.status === 'current' ) || [];

	const searchParams = siteScanActiveThreatsRoute.useSearch();
	const { view, updateView, resetView } = usePersistentView( {
		slug: 'site-scan-active',
		defaultView,
		queryParams: searchParams,
	} );
	const fields = getFields( timezoneString, gmtOffset );
	const actions = useMemo( () => getActions( site, selection.length ), [ site, selection.length ] );
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( threats, view, fields );
	const hasFilters = ( view.filters?.length ?? 0 ) > 0;
	// Known data stays known when a later refetch fails.
	const hasLoaded = scan !== undefined;

	// Nothing to search or filter: the empty state takes the place of the list.
	if ( hasLoaded && threats.length === 0 && ! view.search && ! hasFilters ) {
		return (
			<>
				<PerformanceTrackerStop />
				<DataViewsEmptyStateLayout
					title={ __( 'No threats found' ) }
					description={ __( 'New threats will appear here after each scan.' ) }
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
					// A failed first request says nothing about threats: keep the default message.
					empty={ hasLoaded ? getNoMatchingThreats( view.search, hasFilters ) : undefined }
					fields={ fields }
					getItemId={ ( item ) => item.id.toString() }
					isLoading={ isLoading }
					onChangeSelection={ setSelection }
					onChangeView={ updateView }
					onReset={ resetView }
					paginationInfo={ paginationInfo }
					searchLabel={ __( 'Search' ) }
					selection={ selection }
					view={ view }
				/>
			</CardBody>
		</Card>
	);
}
