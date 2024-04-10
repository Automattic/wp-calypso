import { DataViews } from '@wordpress/dataviews';
import * as React from 'react';
import { useState } from 'react';

interface JetpackSitesTableProps {
	data;
	fields;
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
		hiddenFields: [],
	};

	const [ sitesViewState, setSitesViewState ] = useState( {
		...initialSitesViewState,
	} );

	const totalSites = props.data?.total || 0;
	const totalPages = Math.ceil( totalSites / 50 );

	return (
		<div>
			<DataViews
				data={ props.data }
				fields={ props.fields }
				view={ sitesViewState }
				onChangeView={ setSitesViewState }
				actions={ [] }
				paginationInfo={ { totalItems: totalSites, totalPages: totalPages } }
			/>
		</div>
	);
};

export default JetpackSitesTable;
