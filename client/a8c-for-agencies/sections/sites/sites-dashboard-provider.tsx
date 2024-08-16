import { ReactNode, useEffect, useState } from 'react';
import {
	DATAVIEWS_TABLE,
	initialDataViewsState,
} from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { SitesDashboardContextInterface } from 'calypso/a8c-for-agencies/sections/sites/types';
import {
	DashboardSortInterface,
	Site,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { DEFAULT_SORT_DIRECTION, DEFAULT_SORT_FIELD, filtersMap } from './constants';
import SitesDashboardContext from './sites-dashboard-context';
import type { Filter } from '@wordpress/dataviews';

interface Props {
	showOnlyFavoritesInitialState?: boolean;
	showOnlyDevelopmentInitialState?: boolean;
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
	featurePreview?: ReactNode | null;
}

const buildFilters = ( { issueTypes }: { issueTypes: string } ): Filter[] => {
	const issueTypesArray = issueTypes?.split( ',' );

	return (
		issueTypesArray?.map( ( issueType ) => {
			return {
				field: 'status',
				operator: 'is',
				value: filtersMap.find( ( filterMap ) => filterMap.filterType === issueType )?.ref || 1,
			};
		} ) || []
	);
};

export const SitesDashboardProvider = ( {
	hideListingInitialState = false,
	showOnlyFavoritesInitialState = false,
	showOnlyDevelopmentInitialState = false,
	categoryInitialState,
	siteUrlInitialState,
	siteFeatureInitialState,
	children,
	path,
	searchQuery,
	issueTypes,
	currentPage,
	sort,
	featurePreview,
}: Props ) => {
	const [ hideListing, setHideListing ] = useState( hideListingInitialState );
	const [ selectedCategory, setSelectedCategory ] = useState( categoryInitialState );
	const [ selectedSiteFeature, setSelectedSiteFeature ] = useState( siteFeatureInitialState );
	const [ showOnlyFavorites, setShowOnlyFavorites ] = useState( showOnlyFavoritesInitialState );
	const [ showOnlyDevelopmentSites, setShowOnlyDevelopmentSites ] = useState(
		showOnlyDevelopmentInitialState
	);
	const [ isBulkManagementActive, setIsBulkManagementActive ] = useState( false );
	const [ selectedSites, setSelectedSites ] = useState< Site[] >( [] );
	const [ currentLicenseInfo, setCurrentLicenseInfo ] = useState< string | null >( null );
	const [ mostRecentConnectedSite, setMostRecentConnectedSite ] = useState< string | null >( null );
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );
	const [ initialSelectedSiteUrl, setInitialSelectedSiteUrl ] = useState( siteUrlInitialState );
	const [ recentlyCreatedSiteId, setRecentlyCreatedSiteId ] = useState< number | null >( null );

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

	initialDataViewsState.sort = {
		field: DEFAULT_SORT_FIELD,
		direction: DEFAULT_SORT_DIRECTION,
	};
	initialDataViewsState.fields = [ 'site', 'boost', 'backup', 'monitor', 'scan', 'plugins' ];

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		page: currentPage,
		search: searchQuery,
		sort,
		filters: buildFilters( { issueTypes } ),
	} );

	useEffect( () => {
		setInitialSelectedSiteUrl( siteUrlInitialState );
		if ( ! siteUrlInitialState ) {
			setShowOnlyFavorites( showOnlyFavoritesInitialState );
			setShowOnlyDevelopmentSites( showOnlyDevelopmentInitialState );
			setHideListing( false );
		}

		setDataViewsState( ( previousState ) => ( {
			...previousState,
			...( siteUrlInitialState
				? {}
				: {
						filters: buildFilters( { issueTypes } ),
				  } ),
			...( siteUrlInitialState ? {} : { search: searchQuery } ),
			...( siteUrlInitialState ? {} : { sort } ),
			...( siteUrlInitialState ? {} : { selectedItem: undefined } ),
			...( siteUrlInitialState ? {} : { type: DATAVIEWS_TABLE } ),
		} ) );
	}, [
		setDataViewsState,
		showOnlyFavoritesInitialState,
		showOnlyDevelopmentInitialState,
		searchQuery,
		sort,
		issueTypes,
		siteUrlInitialState,
		setInitialSelectedSiteUrl,
	] );

	const sitesDashboardContextValue: SitesDashboardContextInterface = {
		selectedCategory: selectedCategory,
		setSelectedCategory: setSelectedCategory,
		selectedSiteFeature: selectedSiteFeature,
		setSelectedSiteFeature: setSelectedSiteFeature,
		hideListing: hideListing,
		setHideListing: setHideListing,
		showOnlyFavorites: showOnlyFavorites,
		setShowOnlyFavorites: setShowOnlyFavorites,
		showOnlyDevelopmentSites: showOnlyDevelopmentSites,
		setShowOnlyDevelopmentSites: setShowOnlyDevelopmentSites,
		path,
		currentPage,
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
		dataViewsState,
		setDataViewsState,
		featurePreview,
		recentlyCreatedSiteId,
		setRecentlyCreatedSiteId,
	};
	return (
		<SitesDashboardContext.Provider value={ sitesDashboardContextValue }>
			{ children }
		</SitesDashboardContext.Provider>
	);
};
