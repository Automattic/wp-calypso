import 'calypso/state/themes/init';

/**
 * Returns the theme filter fetch error..
 *
 * @param  {object} state Global state tree
 * @returns {?object}     The theme filter fetch error
 */
export function getThemeFiltersRequestError( state ) {
	return state.themes.themeFilterRequestError;
}
