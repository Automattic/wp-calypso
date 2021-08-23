import 'calypso/state/themes/init';

const emptyList = [];

/**
 * Gets the list of trending themes.
 *
 * @param {object} state Global state tree
 *
 * @returns {Array} the list of trending themes
 */
export function getTrendingThemes( state ) {
	if ( ! state.themes.trendingThemes?.themes ) {
		return emptyList;
	}
	const themes = Object.values( state.themes.trendingThemes?.themes );
	// Only return themes which do not have the "Block Templates" feature.
	// @TODO remove this check when it is valid to do so.
	return themes.filter( ( t ) =>
		t?.taxonomies?.features.every( ( f ) => f.slug !== 'block-templates' )
	);
}
