import classNames from 'classnames';
import * as React from 'react';
import { useContext } from 'react';
import JetpackSitesPreviewPane from '../jetpack-sites-preview-pane';
import JetpackSitesTable from '../jetpack-sites-table';
import JetpackSitesDashboardContext from './jetpack-sites-dashboard-context';
import type { SiteExcerptData } from '@automattic/sites';
import type {
	DataViewsField,
	DataViewsPaginationInfo,
} from 'calypso/components/jetpack-sites-dashboard/types';
import './style.scss';

interface JetpackSitesDashboardProps {
	data: SiteExcerptData[];
	fields: DataViewsField[];
	paginationInfo: DataViewsPaginationInfo;
}

const JetpackSitesDashboard: React.FC< JetpackSitesDashboardProps > = ( props ) => {
	const { sitesViewState } = useContext( JetpackSitesDashboardContext );

	return (
		<div
			className={ classNames(
				'jetpack-sites-dashboard__container',
				! sitesViewState.selectedSiteId && 'preview-hidden'
			) }
		>
			<div className="jetpack-sites-dashboard__column sites-overview">
				<JetpackSitesTable
					data={ props.data }
					fields={ props.fields }
					paginationInfo={ props.paginationInfo }
				/>
			</div>
			{ sitesViewState.selectedSiteId && (
				<div className="jetpack-sites-dashboard__column">
					<JetpackSitesPreviewPane />
				</div>
			) }
		</div>
	);
};

export default JetpackSitesDashboard;
