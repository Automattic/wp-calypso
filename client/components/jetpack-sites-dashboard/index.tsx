import React from 'react';
import JetpackSitesTable from '../jetpack-sites-table';

interface JetpackSitesDashboardProps {
	data;
}

const JetpackSitesDashboard: React.FC< JetpackSitesDashboardProps > = ( props ) => {
	return (
		<div>
			<JetpackSitesTable data={ props.data } />
		</div>
	);
};

export default JetpackSitesDashboard;
