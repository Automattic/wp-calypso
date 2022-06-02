import { createContext } from 'react';
import type { SitesOverviewContextInterface } from './types';

const SitesOverviewContext = createContext< SitesOverviewContextInterface >( {
	currentPage: 1,
	search: '',
	filter: { issueTypes: [] },
} );

export default SitesOverviewContext;
