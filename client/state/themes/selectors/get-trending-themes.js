import 'calypso/state/themes/init';
import { arePremiumThemesEnabled } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const emptyList = [];

/**
 * Gets the list of trending themes.
 *
 * @param {Object} state Global state tree
 * @returns {Array} the list of trending themes
 */
export function getTrendingThemes( state ) {
	if ( ! state.themes.trendingThemes?.themes ) {
		return emptyList;
	}
	let themes = Object.values( state.themes.trendingThemes?.themes );

	// Remove premium themes if not supported
	const siteId = state.ui ? getSelectedSiteId( state ) : false;
	const premiumThemesEnabled = arePremiumThemesEnabled( state, siteId );
	if ( ! premiumThemesEnabled ) {
		themes = themes.filter( ( t ) => ! t?.stylesheet?.startsWith( 'premium/' ) );
	}

	return themes;
}
