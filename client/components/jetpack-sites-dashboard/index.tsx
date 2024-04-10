import React from 'react';
import JetpackSitesTable from '../jetpack-sites-table';

interface JetpackSitesDashboardProps {
	data;
	fields;
}

const JetpackSitesDashboard: React.FC< JetpackSitesDashboardProps > = ( props ) => {
	return (
		<div>
			<JetpackSitesTable data={ props.data } fields={ props.fields } />
		</div>
	);
};

export default JetpackSitesDashboard;
