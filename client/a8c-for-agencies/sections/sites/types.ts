import { SitesViewState } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/sites-dataviews/interfaces';
import {
	DashboardSortInterface,
	Site,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

export * from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

export interface SitesDashboardContextInterface {
	selectedCategory?: string;
	setSelectedCategory: ( category: string ) => void;

	selectedSiteUrl?: string;
	setSelectedSiteUrl: ( siteUrl: string ) => void;

	selectedSiteFeature?: string;
	setSelectedSiteFeature: ( siteFeature: string | undefined ) => void;

	sitesViewState: SitesViewState;
	setSitesViewState: React.Dispatch< React.SetStateAction< SitesViewState > >;

	hideListing?: boolean;
	setHideListing: ( hideListing: boolean ) => void;

	showOnlyFavorites?: boolean;
	setShowOnlyFavorites: ( showOnlyFavorites: boolean ) => void;

	path: string;
	search: string;
	currentPage: number;
	sort: DashboardSortInterface;
	showSitesDashboardV2: boolean;

	isBulkManagementActive: boolean;
	setIsBulkManagementActive: ( value: boolean ) => void;

	selectedSites: Array< Site >;
	setSelectedSites: ( value: Array< Site > ) => void;

	currentLicenseInfo: string | null;
	showLicenseInfo: ( license: string ) => void;
	hideLicenseInfo: () => void;

	mostRecentConnectedSite: string | null;
	setMostRecentConnectedSite: ( mostRecentConnectedSite: string ) => void;

	isPopoverOpen: boolean;
	setIsPopoverOpen: React.Dispatch< React.SetStateAction< boolean > >;
}
