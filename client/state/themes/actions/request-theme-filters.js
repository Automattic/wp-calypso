/**
 * Internal dependencies
 */
import { THEME_FILTERS_REQUEST } from 'calypso/state/themes/action-types';

import 'calypso/state/data-layer/wpcom/theme-filters';
import 'calypso/state/themes/init';

/**
 * Triggers a network request to fetch all available theme filters.
 *
 * @param   {object} params Query parameters object.
 * @returns {object} A nested list of theme filters, keyed by filter slug
 */
export function requestThemeFilters( params = {} ) {
	return {
		type: THEME_FILTERS_REQUEST,
		params,
	};
}
