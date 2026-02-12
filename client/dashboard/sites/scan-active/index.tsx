import { siteScanQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { usePersistentView } from '../../app/hooks/use-persistent-view';
import { siteScanActiveThreatsRoute } from '../../app/router/sites';
import { DataViews, DataViewsEmptyStateLayout } from '../../components/dataviews';
import { useTimeSince } from '../../components/time-since';
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
	const lastScanTime = scan?.most_recent?.timestamp;
	const recentScanRelativeTime = useTimeSince( lastScanTime || '' );

	const NoActiveThreatsFound = () => {
		let title = __( 'Don’t worry about a thing' );
		let description = sprintf(
			/** translators: %s: relative time string like "2 hours ago" */
			__( 'The last scan ran %s and found no security issues.' ),
			recentScanRelativeTime
		);

		if ( view.search || view.filters ) {
			title = __( 'No active threats found' );

			if ( view.search ) {
				description = sprintf(
					/** translators: %s: search query string */
					__( 'Your search for "%s" did not return any results.' ),
					view.search
				);
			}

			if ( view.filters ) {
				description = __( 'No active threats found for the selected filters.' );
			}
		}

		return <DataViewsEmptyStateLayout isBorderless title={ title } description={ description } />;
	};

	return (
		<DataViews< Threat >
			actions={ actions }
			data={ filteredData }
			defaultLayouts={ { table: {} } }
			empty={ <NoActiveThreatsFound /> }
			fields={ fields }
			getItemId={ ( item ) => item.id.toString() }
			isLoading={ isLoading }
			onChangeSelection={ setSelection }
			onChangeView={ updateView }
			onResetView={ resetView }
			paginationInfo={ paginationInfo }
			searchLabel={ __( 'Search' ) }
			selection={ selection }
			view={ view }
		/>
	);
}
