import { DataViews } from '@wordpress/dataviews';
import * as React from 'react';
import { useContext } from 'react';
import JetpackSitesDashboardContext from 'calypso/components/jetpack-sites-dashboard/jetpack-sites-dashboard-context';
import type { DataViewsPaginationInfo } from './types';

interface JetpackSitesTableProps {
	data;
	fields;
	paginationInfo: DataViewsPaginationInfo;
}

const JetpackSitesTable: React.FC< JetpackSitesTableProps > = ( props ) => {
	const { sitesViewState, setSitesViewState } = useContext( JetpackSitesDashboardContext );

	return (
		<div>
			<DataViews
				data={ props.data }
				fields={ props.fields }
				view={ sitesViewState }
				onChangeView={ setSitesViewState }
				actions={ [] }
				paginationInfo={ props.paginationInfo }
			/>
		</div>
	);
};

export default JetpackSitesTable;
