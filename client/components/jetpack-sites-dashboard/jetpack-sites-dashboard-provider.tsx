import { useCallback, useState } from 'react';
import { initialSitesViewState } from './constants';
import JetpackSitesDashboardContext from './jetpack-sites-dashboard-context';

interface JetpackSitesDashboardProviderProps {
	children: React.ReactNode;
}

const JetpackSitesDashboardProvider: React.FC< JetpackSitesDashboardProviderProps > = ( {
	children,
} ) => {
	const [ sitesViewState, setSitesViewState ] = useState( initialSitesViewState );

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

	const closeSitePreviewPane = useCallback( () => {
		if ( sitesViewState.selectedSite ) {
			setSitesViewState( { ...sitesViewState, type: 'table', selectedSite: undefined } );
		}
	}, [ sitesViewState, setSitesViewState ] );

	const jetpackSitesDashboardContextValue = {
		sitesViewState,
		setSitesViewState,
		openSitePreviewPane,
		closeSitePreviewPane,
	};

	return (
		<JetpackSitesDashboardContext.Provider value={ jetpackSitesDashboardContextValue }>
			{ children }
		</JetpackSitesDashboardContext.Provider>
	);
};

export default JetpackSitesDashboardProvider;
