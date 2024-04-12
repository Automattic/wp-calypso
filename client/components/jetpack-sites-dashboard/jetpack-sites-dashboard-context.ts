import { createContext, Dispatch, SetStateAction } from 'react';
import { initialSitesViewState } from './constants';
import { DataViewsState } from './types';

interface JetpackSitesDashboardContextInterface {
	sitesViewState: DataViewsState;
	setSitesViewState: Dispatch< SetStateAction< DataViewsState > >;
	openSitePreviewPane: ( selectedSiteId: number ) => void;
	closeSitePreviewPane: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop(): void {}

const JetpackSitesDashboardContext = createContext< JetpackSitesDashboardContextInterface >( {
	sitesViewState: initialSitesViewState,
	setSitesViewState: noop,
	openSitePreviewPane: noop,
	closeSitePreviewPane: noop,
} );

export default JetpackSitesDashboardContext;
