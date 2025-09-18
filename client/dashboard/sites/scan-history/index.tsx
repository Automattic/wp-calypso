import { siteScanHistoryQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { DataViewsEmptyState } from '../../components/dataviews-empty-state';
import noThreatsIllustration from '../scan-active/no-threats-illustration.svg';
import { getActions } from './dataviews/actions';
import { getFields } from './dataviews/fields';
import type { Threat, Site } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

export function ScanHistoryDataViews( { site }: { site: Site } ) {
	const [ view, setView ] = useState< View >( {
		type: 'table',
		fields: [ 'status', 'fixed_on', 'threat', 'severity' ],
		perPage: 10,
		sort: {
			field: 'fixed_on',
			direction: 'desc',
		},
	} );

	const { data: scanHistory, isLoading } = useQuery( siteScanHistoryQuery( site.ID ) );
	const threats = scanHistory?.threats || [];

	const fields = getFields();
	const actions = getActions();
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( threats, view, fields );

	const NoArchivedThreatsFound = () => {
		let title = __( 'No history yet' );
		let description = __( 'So far, there are no archived threats on your site.' );

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
				description = __( 'No archived threats found for the selected filters.' );
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
			empty={ <NoArchivedThreatsFound /> }
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
