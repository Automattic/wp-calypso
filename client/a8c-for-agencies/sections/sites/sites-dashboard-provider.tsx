import { ReactNode, useEffect, useState } from 'react';
import { SitesViewState } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/sites-dataviews/interfaces';
import {
	DashboardSortInterface,
	Site,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { filtersMap, initialSitesViewState } from './constants';
import SitesDashboardContext from './sites-dashboard-context';

interface Props {
	showOnlyFavoritesInitialState?: boolean;
	hideListingInitialState?: boolean;
	categoryInitialState?: string;
	siteUrlInitialState?: string;
	siteFeatureInitialState?: string;
	searchQuery: string;
	children: ReactNode;
	path: string;
	issueTypes: string;
	currentPage: number;
	sort: DashboardSortInterface;
	showSitesDashboardV2: boolean;
}

export const SitesDashboardProvider = ( {
	hideListingInitialState = false,
	showOnlyFavoritesInitialState = false,
	categoryInitialState,
	siteUrlInitialState,
	siteFeatureInitialState,
	children,
	path,
	searchQuery,
	issueTypes,
	currentPage,
	sort,
}: Props ) => {
	const [ hideListing, setHideListing ] = useState( hideListingInitialState );
	const [ selectedCategory, setSelectedCategory ] = useState( categoryInitialState );
	const [ selectedSiteFeature, setSelectedSiteFeature ] = useState( siteFeatureInitialState );
	const [ showOnlyFavorites, setShowOnlyFavorites ] = useState( showOnlyFavoritesInitialState );
	const [ isBulkManagementActive, setIsBulkManagementActive ] = useState( false );
	const [ selectedSites, setSelectedSites ] = useState< Site[] >( [] );
	const [ currentLicenseInfo, setCurrentLicenseInfo ] = useState< string | null >( null );
	const [ mostRecentConnectedSite, setMostRecentConnectedSite ] = useState< string | null >( null );
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );
	const [ initialSelectedSiteUrl, setInitialSelectedSiteUrl ] = useState( siteUrlInitialState );

	const handleSetBulkManagementActive = ( isActive: boolean ) => {
		setIsBulkManagementActive( isActive );
		if ( ! isActive ) {
			setSelectedSites( [] );
		}
	};

	const onShowLicenseInfo = ( license: string ) => {
		setCurrentLicenseInfo( license );
	};

	const onHideLicenseInfo = () => {
		setCurrentLicenseInfo( null );
	};

	const [ sitesViewState, setSitesViewState ] = useState< SitesViewState >( {
		...initialSitesViewState,
		page: currentPage,
		search: searchQuery,
	} );

	useEffect( () => {
		setInitialSelectedSiteUrl( siteUrlInitialState );
		if ( ! siteUrlInitialState ) {
			setShowOnlyFavorites( () => showOnlyFavoritesInitialState );
			setHideListing( false );
		}

		const issueTypesArray = issueTypes?.split( ',' );
		setSitesViewState( ( previousState ) => ( {
			...previousState,
			...( siteUrlInitialState
				? {}
				: {
						filters:
							issueTypesArray?.map( ( issueType ) => {
								return {
									field: 'status',
									operator: 'in',
									value:
										filtersMap.find( ( filterMap ) => filterMap.filterType === issueType )?.ref ||
										1,
								};
							} ) || [],
				  } ),
			...( siteUrlInitialState ? {} : { search: searchQuery } ),
			...( siteUrlInitialState ? {} : { selectedSite: undefined } ),
			...( siteUrlInitialState ? {} : { type: 'table' } ),
		} ) );
	}, [
		setSitesViewState,
		showOnlyFavoritesInitialState,
		searchQuery,
		issueTypes,
		siteUrlInitialState,
		setInitialSelectedSiteUrl,
	] );

	const sitesDashboardContextValue = {
		selectedCategory: selectedCategory,
		setSelectedCategory: setSelectedCategory,
		selectedSiteFeature: selectedSiteFeature,
		setSelectedSiteFeature: setSelectedSiteFeature,
		hideListing: hideListing,
		setHideListing: setHideListing,
		showOnlyFavorites: showOnlyFavorites,
		setShowOnlyFavorites: setShowOnlyFavorites,
		path,
		currentPage,
		sort,
		isBulkManagementActive,
		initialSelectedSiteUrl: initialSelectedSiteUrl,
		setIsBulkManagementActive: handleSetBulkManagementActive,
		selectedSites,
		setSelectedSites,
		currentLicenseInfo,
		showLicenseInfo: onShowLicenseInfo,
		hideLicenseInfo: onHideLicenseInfo,
		mostRecentConnectedSite,
		setMostRecentConnectedSite,
		isPopoverOpen,
		setIsPopoverOpen,
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
