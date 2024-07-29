import { createContext } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import type { SitesDashboardContextInterface } from './types';

const SitesDashboardContext = createContext< SitesDashboardContextInterface >( {
	selectedCategory: undefined,
	setSelectedCategory: () => {},

	selectedSiteFeature: undefined,
	setSelectedSiteFeature: () => {},

	hideListing: undefined,
	setHideListing: () => {},

	showOnlyFavorites: undefined,
	setShowOnlyFavorites: () => {},

	dataViewsState: initialDataViewsState,
	setDataViewsState: () => {},

	initialSelectedSiteUrl: '',
	currentPage: 1,
	path: '',
	featurePreview: null,

	isBulkManagementActive: false,
	setIsBulkManagementActive: () => {},

	selectedSites: [],
	setSelectedSites: () => {},

	currentLicenseInfo: null,
	showLicenseInfo: () => {},
	hideLicenseInfo: () => {},

	mostRecentConnectedSite: null,
	setMostRecentConnectedSite: () => {},

	isPopoverOpen: false,
	setIsPopoverOpen: () => {},
} );

export default SitesDashboardContext;
