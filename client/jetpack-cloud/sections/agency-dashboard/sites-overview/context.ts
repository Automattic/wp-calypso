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
} );

export default SitesOverviewContext;
