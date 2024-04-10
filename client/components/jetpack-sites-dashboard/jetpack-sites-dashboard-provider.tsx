import { useCallback, useState } from 'react';
import JetpackSitesDashboardContext from './jetpack-sites-dashboard-context';

export const JetpackSitesDashboardProvider = ( props ) => {
	const initialSitesViewState = {
		type: 'table',
		perPage: 50,
		page: 1,
		sort: {
			field: 'site',
			direction: 'asc',
		},
		search: '',
		filters: [],
		layout: {},
		hiddenFields: [],
	};

	const [ sitesViewState, setSitesViewState ] = useState( {
		...initialSitesViewState,
	} );

	const openSitePreviewPane = useCallback(
		( site ) => {
			setSitesViewState( {
				...sitesViewState,
				selectedSite: site,
				type: 'list',
			} );
		},
		[ setSitesViewState, sitesViewState ]
	);

	const jetpackSitesDashboardContextValue = {
		sitesViewState,
		setSitesViewState,
		openSitePreviewPane,
	};

	return (
		<JetpackSitesDashboardContext.Provider value={ jetpackSitesDashboardContextValue }>
			{ props.children }
		</JetpackSitesDashboardContext.Provider>
	);
};
