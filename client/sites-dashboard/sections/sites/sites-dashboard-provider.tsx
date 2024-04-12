import { ReactNode, useEffect, useState } from 'react';
import { filtersMap, initialSitesViewState } from './constants';
import SitesDashboardContext from './sites-dashboard-context';
import { DashboardSortInterface } from './sites-overview/types';
import { SitesViewState } from './types';

interface Props {
	categoryInitialState?: string;
	siteUrlInitialState?: string;
	hideListingInitialState?: boolean;
	searchQuery: string;
	children: ReactNode;
	path: string;
	issueTypes: string;
	currentPage: number;
	sort: DashboardSortInterface;
	showSitesDashboardV2: boolean;
}

export const SitesDashboardProvider = ( {
	categoryInitialState,
	siteUrlInitialState,
	hideListingInitialState = false,
	children,
	path,
	searchQuery,
	issueTypes,
	currentPage,
	sort,
}: Props ) => {
	const [ hideListing, setHideListing ] = useState( hideListingInitialState );
	const [ selectedCategory, setSelectedCategory ] = useState( categoryInitialState );
	const [ initialSelectedSiteUrl, setInitialSelectedSiteUrl ] = useState( siteUrlInitialState );

	const [ sitesViewState, setSitesViewState ] = useState< SitesViewState >( {
		...initialSitesViewState,
		page: currentPage,
		search: searchQuery,
	} );

	useEffect( () => {
		setInitialSelectedSiteUrl( siteUrlInitialState );

		setSitesViewState( ( previousState ) => ( {
			...previousState,
			filters: [],
			search: searchQuery,
			...( siteUrlInitialState ? {} : { selectedSite: undefined } ),
			...( siteUrlInitialState ? {} : { type: 'table' } ),
		} ) );
	}, [
		setSitesViewState,
		searchQuery,
		issueTypes,
		siteUrlInitialState,
		setInitialSelectedSiteUrl,
	] );

	const sitesDashboardContextValue = {
		selectedCategory: selectedCategory,
		setSelectedCategory: setSelectedCategory,
		hideListing: hideListing,
		setHideListing: setHideListing,
		path,
		currentPage,
		sort,
		initialSelectedSiteUrl: initialSelectedSiteUrl,
		sitesViewState,
		setSitesViewState,
		showSitesDashboardV2: true,
	};
	return (
		<SitesDashboardContext.Provider value={ sitesDashboardContextValue }>
			{ children }
		</SitesDashboardContext.Provider>
	);
};
