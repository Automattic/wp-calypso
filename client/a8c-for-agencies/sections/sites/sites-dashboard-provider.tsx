import { DESKTOP_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
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
import { filtersMap } from './constants';
import SitesDashboardContext from './sites-dashboard-context';
import type { Filter } from '@wordpress/dataviews';

interface Props {
	showOnlyFavoritesInitialState?: boolean;
	showOnlyDevelopmentInitialState?: boolean;
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

const EMPTY_ARRAY: string[] = [];

export const SitesDashboardProvider = ( {
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

	// Limit fields on breakpoints smaller than 960px wide.
	const isDesktop = useBreakpoint( DESKTOP_BREAKPOINT );
	const desktopFields = [ 'stats', 'boost', 'backup', 'monitor', 'scan', 'plugins', 'favorite' ];
	const getFieldsByBreakpoint = ( isDesktop: boolean ) =>
		isDesktop ? desktopFields : EMPTY_ARRAY;

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		titleField: 'url',
		fields: getFieldsByBreakpoint( isDesktop ),
		page: currentPage,
		search: searchQuery,
		sort,
		filters: buildFilters( { issueTypes } ),
	} );

	useEffect( () => {
		const fields = getFieldsByBreakpoint( isDesktop );
		const fieldsForBreakpoint = [ ...fields ].sort().toString();
		const existingFields = [ ...( dataViewsState?.fields ?? [] ) ].sort().toString();
		// Compare the content of the arrays, not its referrences that will always be different.
		// sort() sorts the array in place, so we need to clone them first.
		if ( existingFields !== fieldsForBreakpoint ) {
			setDataViewsState( ( prevState ) => ( { ...prevState, fields } ) );
		}
	}, [ isDesktop, dataViewsState?.fields ] );

	useEffect( () => {
		setInitialSelectedSiteUrl( siteUrlInitialState );
		if ( ! siteUrlInitialState ) {
			setShowOnlyFavorites( showOnlyFavoritesInitialState );
			setShowOnlyDevelopmentSites( showOnlyDevelopmentInitialState );
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
	};
	return (
		<SitesDashboardContext.Provider value={ sitesDashboardContextValue }>
			{ children }
		</SitesDashboardContext.Provider>
	);
};
