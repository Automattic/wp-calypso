import 'calypso/state/themes/init';
import { arePremiumThemesEnabled } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const emptyList = [];

/**
 * Gets the list of recommended themes.
 *
 * @param {Object} state Global state tree
 * @param {string} filter A filter string for a theme query
 * @returns {Array} the list of recommended themes
 */
export function getRecommendedThemes( state, filter ) {
	let themes = state.themes.recommendedThemes[ filter ]?.themes || emptyList;

	// Remove premium themes if not supported
	const siteId = state.ui ? getSelectedSiteId( state ) : false;
	const premiumThemesEnabled = arePremiumThemesEnabled( state, siteId );
	if ( ! premiumThemesEnabled ) {
		themes = themes.filter( ( t ) => ! t?.stylesheet?.startsWith( 'premium/' ) );
	}

	return themes;
}
