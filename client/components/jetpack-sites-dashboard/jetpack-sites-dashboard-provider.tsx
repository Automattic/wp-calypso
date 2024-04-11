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

	const openSitePreviewPane = useCallback( () => {
		setSitesViewState( {
			...sitesViewState,
			type: 'list',
		} );
	}, [ setSitesViewState, sitesViewState ] );

	const jetpackSitesDashboardContextValue = {
		sitesViewState,
		setSitesViewState,
		openSitePreviewPane,
	};

	return (
		<JetpackSitesDashboardContext.Provider value={ jetpackSitesDashboardContextValue }>
			{ children }
		</JetpackSitesDashboardContext.Provider>
	);
};

export default JetpackSitesDashboardProvider;
