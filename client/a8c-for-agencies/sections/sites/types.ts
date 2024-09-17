import { ReactNode, SetStateAction, Dispatch } from 'react';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { Site } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

export * from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

export interface SitesDashboardContextInterface {
	selectedCategory?: string;
	setSelectedCategory: ( category: string ) => void;

	selectedSiteFeature?: string;
	setSelectedSiteFeature: ( siteFeature: string | undefined ) => void;

	dataViewsState: DataViewsState;
	setDataViewsState: React.Dispatch< React.SetStateAction< DataViewsState > >;

	hideListing?: boolean;
	setHideListing: ( hideListing: boolean ) => void;

	showOnlyFavorites?: boolean;
	setShowOnlyFavorites: ( showOnlyFavorites: boolean ) => void;

	showOnlyDevelopmentSites?: boolean;
	setShowOnlyDevelopmentSites: ( showOnlyDevelopmentSites: boolean ) => void;

	initialSelectedSiteUrl?: string;
	path: string;
	currentPage: number;

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
	setIsPopoverOpen: Dispatch< SetStateAction< boolean > >;

	featurePreview: ReactNode | null;

	recentlyCreatedSiteId: number | null;
	setRecentlyCreatedSiteId: ( value: number ) => void;

	isRecentlyCreatedSiteDevelopment: boolean;
	setIsRecentlyCreatedSiteDevelopment: ( value: boolean ) => void;
}
