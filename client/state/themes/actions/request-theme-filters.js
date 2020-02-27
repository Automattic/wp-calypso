/**
 * Internal dependencies
 */
import { THEME_FILTERS_REQUEST } from 'state/action-types';

import 'state/data-layer/wpcom/theme-filters';
import 'state/themes/init';

/**
 * Triggers a network request to fetch all available theme filters.
 *
 * @returns {object} A nested list of theme filters, keyed by filter slug
 */
export function requestThemeFilters() {
	return {
		type: THEME_FILTERS_REQUEST,
	};
}
