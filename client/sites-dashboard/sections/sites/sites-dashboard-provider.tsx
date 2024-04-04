import { ReactNode, useEffect, useState } from 'react';
import { filtersMap, initialSitesViewState } from './constants';
import SitesDashboardContext from './sites-dashboard-context';
import {
	DashboardSortInterface,
	SitesViewState,
} from './types';

interface Props {
	categoryInitialState?: string;
	siteUrlInitialState?: string;
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
	children,
	path,
	searchQuery,
	issueTypes,
	currentPage,
	sort,
}: Props ) => {

	const [ selectedCategory, setSelectedCategory ] = useState( categoryInitialState );
	const [ initialSelectedSiteUrl, setInitialSelectedSiteUrl ] = useState( siteUrlInitialState );

	const [ sitesViewState, setSitesViewState ] = useState< SitesViewState >( {
		...initialSitesViewState,
		page: currentPage,
		search: searchQuery,
	} );

	useEffect( () => {
		setInitialSelectedSiteUrl( siteUrlInitialState );

		const issueTypesArray = issueTypes?.split( ',' );

		setSitesViewState( ( previousState ) => ( {
			...previousState,
			filters:
				issueTypesArray?.map( ( issueType ) => {
					return {
						field: 'status',
						operator: 'in',
						value: filtersMap.find( ( filterMap ) => filterMap.filterType === issueType )?.ref || 1,
					};
				} ) || [],
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
