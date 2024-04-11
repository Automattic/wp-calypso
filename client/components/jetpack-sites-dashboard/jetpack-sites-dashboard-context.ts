import { createContext } from 'react';
import { initialSitesViewState } from './constants';

const JetpackSitesDashboardContext = createContext( {
	sitesViewState: initialSitesViewState,
	setSitesViewState: () => {},
	openSitePreviewPane: () => {},
	closeSitePreviewPane: () => {},
} );

export default JetpackSitesDashboardContext;
