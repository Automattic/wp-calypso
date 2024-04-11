import React from 'react';
import JetpackSitesTable from '../jetpack-sites-table';
import type { DataViewsPaginationInfo } from '../jetpack-sites-table/types';

interface JetpackSitesDashboardProps {
	data;
	fields;
	paginationInfo: DataViewsPaginationInfo;
}

const JetpackSitesDashboard: React.FC< JetpackSitesDashboardProps > = ( props ) => {
	return (
		<JetpackSitesTable
			data={ props.data }
			fields={ props.fields }
			paginationInfo={ props.paginationInfo }
		/>
	);
};

export default JetpackSitesDashboard;
