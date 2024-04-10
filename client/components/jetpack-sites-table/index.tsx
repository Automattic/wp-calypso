import { DataViews } from '@wordpress/dataviews';
import * as React from 'react';
import { useContext } from 'react';
import JetpackSitesDashboardContext from 'calypso/components/jetpack-sites-dashboard/jetpack-sites-dashboard-context';

interface JetpackSitesTableProps {
	data;
	fields;
}

const JetpackSitesTable: React.FC< JetpackSitesTableProps > = ( props ) => {
	const { sitesViewState, setSitesViewState } = useContext( JetpackSitesDashboardContext );
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
