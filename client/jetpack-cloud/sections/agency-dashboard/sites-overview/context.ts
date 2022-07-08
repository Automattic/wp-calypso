import { createContext } from 'react';
import type { SitesOverviewContextInterface } from './types';

const SitesOverviewContext = createContext< SitesOverviewContextInterface >( {
	currentPage: 1,
	search: '',
	filter: { issueTypes: [], showOnlyFavorites: false },
} );

export default SitesOverviewContext;
