import { createContext } from 'react';
import { initialSitesViewState } from './constants';
import type { SitesDashboardContextInterface } from './types';

const SitesDashboardContext = createContext< SitesDashboardContextInterface >( {
	selectedCategory: undefined,
	setSelectedCategory: () => {},

	sitesViewState: initialSitesViewState,
	setSitesViewState: () => {
		return undefined;
	},

	initialSelectedSiteUrl: '',
	currentPage: 1,
	path: '',
	sort: {
		field: 'url',
		direction: 'asc',
	},
} );

export default SitesDashboardContext;
