import 'calypso/state/themes/init';

/**
 * Returns the theme filter fetch error..
 *
 * @param  {Object} state Global state tree
 * @returns {?Object}     The theme filter fetch error
 */
export function getThemeFiltersRequestError( state ) {
	return state.themes.themeFilterRequestError;
}
