import { DataViews } from '@wordpress/dataviews';
import * as React from 'react';
import { useContext } from 'react';
import JetpackSitesDashboardContext from 'calypso/components/jetpack-sites-dashboard/jetpack-sites-dashboard-context';
import type { SiteExcerptData } from '@automattic/sites';
import type {
	DataViewsField,
	DataViewsPaginationInfo,
} from 'calypso/components/jetpack-sites-dashboard/types';

interface JetpackSitesTableProps {
	data: SiteExcerptData[];
	fields: DataViewsField[];
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
