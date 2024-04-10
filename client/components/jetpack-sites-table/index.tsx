import { DataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import * as React from 'react';
import { useCallback, useState } from 'react';

interface JetpackSitesTableProps {
	data;
}

const JetpackSitesTable: React.FC< JetpackSitesTableProps > = ( props ) => {
	const initialSitesViewState = {
		type: 'table',
		perPage: 50,
		page: 1,
		sort: {
			field: 'site',
			direction: 'asc',
		},
		search: '',
		filters: [],
		layout: {},
		selectedSite: undefined,
	};

	const [ sitesViewState, setSitesViewState ] = useState( {
		...initialSitesViewState,
	} );

	const totalSites = props.data?.total || 0;
	const totalPages = Math.ceil( totalSites / 50 );

	const openSitePreviewPane = useCallback(
		( site ) => {
			setSitesViewState( {
				...sitesViewState,
				selectedSite: site,
				type: 'list',
			} );
		},
		[ setSitesViewState, sitesViewState ]
	);

	const fields = [
		{
			id: 'site',
			header: __( 'Site' ),
			enableHiding: false,
			enableSorting: true,
		},
		{
			id: 'plan',
			header: __( 'Plan' ),
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'status',
			header: __( 'Status' ),
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'last-publish',
			header: __( 'Last Publish' ),
			enableHiding: false,
			enableSorting: true,
		},
		{
			id: 'stats',
			header: __( 'Stats' ),
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'actions',
			header: __( 'Actions' ),
			enableHiding: false,
			enableSorting: false,
		},
	];

	return (
		<div>
			<DataViews
				data={ props.data }
				fields={ fields }
				view={ sitesViewState }
				onChangeView={ setSitesViewState }
				actions={ [] }
				paginationInfo={ { totalItems: totalSites, totalPages: totalPages } }
			/>
		</div>
	);
};

export default JetpackSitesTable;
