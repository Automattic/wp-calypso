import * as React from 'react';
import { useContext } from 'react';
import JetpackSitesPreviewPane from '../jetpack-sites-preview-pane';
import JetpackSitesTable from '../jetpack-sites-table';
import JetpackSitesDashboardContext from './jetpack-sites-dashboard-context';
import type { DataViewsPaginationInfo } from '../jetpack-sites-table/types';
import './style.scss';

interface JetpackSitesDashboardProps {
	data;
	fields;
	paginationInfo: DataViewsPaginationInfo;
}

const JetpackSitesDashboard: React.FC< JetpackSitesDashboardProps > = ( props ) => {
	const { sitesViewState } = useContext( JetpackSitesDashboardContext );

	return (
		<div className="jetpack-sites-dashboard__container">
			<div className="jetpack-sites-dashboard__column sites-overview">
				<JetpackSitesTable
					data={ props.data }
					fields={ props.fields }
					paginationInfo={ props.paginationInfo }
				/>
			</div>
			{ sitesViewState.selectedSite && (
				<div className="jetpack-sites-dashboard__column">
					<JetpackSitesPreviewPane />
				</div>
			) }
		</div>
	);
};

export default JetpackSitesDashboard;
