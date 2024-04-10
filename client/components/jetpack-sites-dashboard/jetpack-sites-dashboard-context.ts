import { createContext } from 'react';

const JetpackSitesDashboardContext = createContext( {
	sitesViewState: {
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
	},
	setSitesViewState: () => {},
	openSitePreviewPane: () => {},
} );

export default JetpackSitesDashboardContext;
