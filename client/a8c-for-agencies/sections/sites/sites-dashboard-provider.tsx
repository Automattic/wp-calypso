import { ReactNode, useState } from 'react';
import {
	AgencyDashboardFilterOption,
	DashboardSortInterface,
	Site,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import SitesDashboardContext from './sites-dashboard-context';

interface Props {
	hideListingInitialState?: boolean;
	categoryInitialState?: string;
	siteUrlInitialState?: string;
	siteFeatureInitialState?: string;
	children: ReactNode;
	path: string;
	search: string;
	currentPage: number;
	filter: { issueTypes: Array< AgencyDashboardFilterOption >; showOnlyFavorites: boolean };
	sort: DashboardSortInterface;
	showSitesDashboardV2: boolean;
}

export const SitesDashboardProvider = ( {
	hideListingInitialState = false,
	categoryInitialState,
	siteUrlInitialState,
	siteFeatureInitialState,
	children,
	path,
	search,
	currentPage,
	filter,
	sort,
}: Props ) => {
	const [ hideListing, setHideListing ] = useState( hideListingInitialState );
	const [ selectedCategory, setSelectedCategory ] = useState( categoryInitialState );
	const [ selectedSiteUrl, setSelectedSiteUrl ] = useState( siteUrlInitialState );
	const [ selectedSiteFeature, setSelectedSiteFeature ] = useState( siteFeatureInitialState );

	const [ isBulkManagementActive, setIsBulkManagementActive ] = useState( false );
	const [ selectedSites, setSelectedSites ] = useState< Site[] >( [] );
	const [ currentLicenseInfo, setCurrentLicenseInfo ] = useState< string | null >( null );
	const [ mostRecentConnectedSite, setMostRecentConnectedSite ] = useState< string | null >( null );
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );

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

	const sitesDashboardContextValue = {
		selectedCategory: selectedCategory,
		setSelectedCategory: setSelectedCategory,
		selectedSiteUrl: selectedSiteUrl,
		setSelectedSiteUrl: setSelectedSiteUrl,
		selectedSiteFeature: selectedSiteFeature,
		setSelectedSiteFeature: setSelectedSiteFeature,
		hideListing: hideListing,
		setHideListing: setHideListing,
		path,
		search,
		currentPage,
		filter,
		sort,
		isBulkManagementActive,
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
		showSitesDashboardV2: true,
	};

	return (
		<SitesDashboardContext.Provider value={ sitesDashboardContextValue }>
			{ children }
		</SitesDashboardContext.Provider>
	);
};
