import 'calypso/state/themes/init';
import { arePremiumThemesEnabled } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const emptyList = [];

/**
 * Gets the list of trending themes.
 *
 * @param {object} state Global state tree
 * @returns {Array} the list of trending themes
 */
export function getTrendingThemes( state ) {
	if ( ! state.themes.trendingThemes?.themes ) {
		return emptyList;
	}
	let themes = Object.values( state.themes.trendingThemes?.themes );
	// Only return themes which do not have the "Block Templates" feature.
	// @TODO remove this check when it is valid to do so.
	themes = themes.filter( ( t ) =>
		t?.taxonomies?.features.every( ( f ) => f.slug !== 'block-templates' )
	);

	// Remove premium themes if not supported
	const siteId = getSelectedSiteId( state );
	const premiumThemesEnabled = arePremiumThemesEnabled( state, siteId );
	if ( ! premiumThemesEnabled ) {
		themes = themes.filter( ( t ) => ! t?.stylesheet?.startsWith( 'premium/' ) );
	}

	return themes;
}
