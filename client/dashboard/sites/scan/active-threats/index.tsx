import { siteScanQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { getActions } from './dataviews/actions';
import { getFields } from './dataviews/fields';
import type { Threat, Site } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';
import '../style.scss';

export function ActiveThreatsDataViews( { site }: { site: Site } ) {
	const [ view, setView ] = useState< View >( {
		type: 'table',
		fields: [ 'severity', 'threat', 'first_detected', 'auto_fix' ],
		perPage: 10,
		filters: [],
		search: '',
	} );

	const emptyMessage =
		view.filters && view.filters.length > 0
			? __( 'No active threats found with the current filters.' )
			: __( 'No active threats found. Your site is secure.' );

	const { data: threats = [], isLoading } = useQuery( {
		...siteScanQuery( site.ID ),
		select: ( scan ) => scan.threats.filter( ( threat ) => threat.status === 'current' ),
	} );

	const fields = getFields();
	const actions = getActions();
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( threats, view, fields );

	return (
		<DataViews< Threat >
			actions={ actions }
			data={ filteredData }
			defaultLayouts={ { table: {} } }
			empty={ emptyMessage }
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
