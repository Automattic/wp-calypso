import { siteScanQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { DataViewsEmptyState } from '../../components/dataviews-empty-state';
import { useTimeSince } from '../../components/time-since';
import { getActions } from './dataviews/actions';
import { getFields } from './dataviews/fields';
import noThreatsIllustration from './no-threats-illustration.svg';
import type { Threat, Site } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

export function ActiveThreatsDataViews( { site }: { site: Site } ) {
	const [ view, setView ] = useState< View >( {
		type: 'table',
		fields: [ 'severity', 'threat', 'first_detected', 'auto_fix' ],
		perPage: 10,
		sort: { field: 'severity', direction: 'desc' },
	} );

	const { data: scan, isLoading } = useQuery( siteScanQuery( site.ID ) );
	const threats = scan?.threats.filter( ( threat ) => threat.status === 'current' ) || [];

	const fields = getFields();
	const actions = getActions( site.ID );
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( threats, view, fields );
	const lastScanTime = scan?.most_recent?.timestamp;
	const recentScanRelativeTime = useTimeSince( lastScanTime || '' );

	const NoActiveThreatsFound = () => {
		let title = __( 'Don’t worry about a thing' );
		let description = sprintf(
			/** translators: %s: relative time string like "2 hours ago" */
			__( 'The last scan ran %s and everything looked great.' ),
			recentScanRelativeTime
		);

		if ( view.search || view.filters ) {
			title = __( 'No archived threats found' );

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

		return (
			<DataViewsEmptyState
				title={ title }
				description={ description }
				illustration={
					<img
						src={ noThreatsIllustration }
						alt={ __( 'No threats found illustration' ) }
						width={ 408 }
						height={ 280 }
					/>
				}
			/>
		);
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
			onChangeView={ setView }
			paginationInfo={ paginationInfo }
			searchLabel={ __( 'Search' ) }
			view={ view }
		/>
	);
}
