import { createContext } from 'react';
import type { SitesOverviewContextInterface } from './types';

const SitesOverviewContext = createContext< SitesOverviewContextInterface >( {
	currentPage: 1,
	search: '',
	filter: { issueTypes: [], showOnlyFavorites: false },
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
	sort: {
		field: 'url',
		direction: 'asc',
	},
} );

export default SitesOverviewContext;
