import * as React from 'react';
import { useContext } from 'react';
import JetpackSitesPreviewPane from '../jetpack-sites-preview-pane';
import JetpackSitesTable from '../jetpack-sites-table';
import JetpackSitesDashboardContext from './jetpack-sites-dashboard-context';
import type { DataViewsPaginationInfo } from '../jetpack-sites-table/types';

interface JetpackSitesDashboardProps {
	data;
	fields;
	paginationInfo: DataViewsPaginationInfo;
}

const JetpackSitesDashboard: React.FC< JetpackSitesDashboardProps > = ( props ) => {
	const { sitesViewState } = useContext( JetpackSitesDashboardContext );

	return (
		<div>
			<JetpackSitesTable
				data={ props.data }
				fields={ props.fields }
				paginationInfo={ props.paginationInfo }
			/>
			{ sitesViewState.selectedSite && <JetpackSitesPreviewPane /> }
		</div>
	);
};

export default JetpackSitesDashboard;
