import { ReactNode, useState } from 'react';
import SitesOverviewContext from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/context';
import {
	AgencyDashboardFilterOption,
	DashboardSortInterface,
	Site,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

interface Props {
	path: string;
	search: string;
	currentPage: number;
	filter: { issueTypes: Array< AgencyDashboardFilterOption >; showOnlyFavorites: boolean };
	sort: DashboardSortInterface;
	children: ReactNode;
}

export const SitesOverviewProvider = ( {
	path,
	search,
	currentPage,
	filter,
	sort,
	children,
}: Props ) => {
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

	const sitesOverviewContextValue = {
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
		<SitesOverviewContext.Provider value={ sitesOverviewContextValue }>
			{ children }
		</SitesOverviewContext.Provider>
	);
};
