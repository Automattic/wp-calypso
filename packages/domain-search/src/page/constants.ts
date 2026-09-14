import type { FilterState } from '../components/search-bar/types';

export const DEFAULT_FILTER: FilterState = {
	exactSldMatchesOnly: false,
	tlds: [],
};

export const DOMAIN_BUNDLE_UNAVAILABLE_ERROR_CODE = 'domain_bundle_unavailable';
