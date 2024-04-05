import { createContext } from 'react';
import { initialSitesViewState } from './constants';
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

	sitesViewState: initialSitesViewState,
	setSitesViewState: () => {},

	initialSelectedSiteUrl: '',
	currentPage: 1,
	path: '',
	showSitesDashboardV2: false,

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
