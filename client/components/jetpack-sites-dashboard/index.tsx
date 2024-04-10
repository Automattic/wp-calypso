import React from 'react';
import JetpackSitesTable from '../jetpack-sites-table';
import { JetpackSitesDashboardProvider } from './jetpack-sites-dashboard-provider';

interface JetpackSitesDashboardProps {
	data;
	fields;
}

const JetpackSitesDashboard: React.FC< JetpackSitesDashboardProps > = ( props ) => {
	return (
		<JetpackSitesDashboardProvider>
			<JetpackSitesTable data={ props.data } fields={ props.fields } />
		</JetpackSitesDashboardProvider>
	);
};

export default JetpackSitesDashboard;
