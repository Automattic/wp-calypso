import { createContext } from 'react';
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
} );

export default SitesDashboardContext;
