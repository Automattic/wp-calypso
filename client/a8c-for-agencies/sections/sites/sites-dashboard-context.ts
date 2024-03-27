import { createContext } from 'react';
import { initialSitesViewState } from './constants';
import type { SitesDashboardContextInterface } from './types';

const SitesDashboardContext = createContext< SitesDashboardContextInterface >( {
	selectedCategory: undefined,
	setSelectedCategory: () => {},

	selectedSiteUrl: undefined,
	setSelectedSiteUrl: () => {},

	selectedSiteFeature: undefined,
	setSelectedSiteFeature: () => {},

	hideListing: undefined,
	setHideListing: () => {},

	showOnlyFavorites: undefined,
	setShowOnlyFavorites: () => {},

	sitesViewState: initialSitesViewState,
	setSitesViewState: () => {
		return undefined;
	},

	currentPage: 1,
	path: '',
	isBulkManagementActive: false,
	showSitesDashboardV2: false,
	setIsBulkManagementActive: () => {
		return undefined;
	},
	selectedSites: [],
	setSelectedSites: () => {
		return undefined;
	},
	currentLicenseInfo: null,
	showLicenseInfo: () => {
		return undefined;
	},
	hideLicenseInfo: () => {
		return undefined;
	},
	mostRecentConnectedSite: null,
	setMostRecentConnectedSite: () => {
		return undefined;
	},
	isPopoverOpen: false,
	setIsPopoverOpen: () => {
		return undefined;
	},
	sort: {
		field: 'url',
		direction: 'asc',
	},
} );

export default SitesDashboardContext;
