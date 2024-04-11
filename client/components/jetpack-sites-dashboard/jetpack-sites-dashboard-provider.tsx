import { useCallback, useState } from 'react';
import { initialSitesViewState } from './constants';
import JetpackSitesDashboardContext from './jetpack-sites-dashboard-context';

const JetpackSitesDashboardProvider = ( props ) => {
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
			{ props.children }
		</JetpackSitesDashboardContext.Provider>
	);
};

export default JetpackSitesDashboardProvider;
