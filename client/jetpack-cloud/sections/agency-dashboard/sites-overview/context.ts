import { createContext } from 'react';
import type { SitesOverviewContextInterface } from './types';

const SitesOverviewContext = createContext< SitesOverviewContextInterface >( {
	currentPage: 1,
	path: '',
	search: '',
	filter: { issueTypes: [], showOnlyFavorites: false, showOnlyDevelopmentSites: false },
	isBulkManagementActive: false,
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

export default SitesOverviewContext;
