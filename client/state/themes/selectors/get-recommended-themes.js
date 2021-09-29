import isSiteUsingCoreSiteEditor from 'calypso/state/selectors/is-site-using-core-site-editor';
import 'calypso/state/themes/init';

const emptyList = [];

/**
 * Gets the list of recommended themes.
 *
 * @param {object} state Global state tree
 * @param {string|number} siteId The current site ID
 *
 * @returns {Array} the list of recommended themes
 */
export function getRecommendedThemes( state, siteId ) {
	// TODO: ensure support for jetpack and wporg queries
	let recommendedThemes = [];
	const isUsingSiteEditor = isSiteUsingCoreSiteEditor( state, siteId );
	const blockThemes = state?.themes?.queries?.wpcom?.getItemsIgnoringPage( {
		filter: 'block-templates',
	} );

	const classicThemes = state?.themes?.queries?.wpcom?.getItemsIgnoringPage( {
		filter: 'auto-loading-homepage',
	} );

	if ( blockThemes && isUsingSiteEditor ) {
		recommendedThemes = [ ...recommendedThemes, ...blockThemes ];
	}

	if ( classicThemes ) {
		recommendedThemes = [ ...recommendedThemes, ...classicThemes ];
	}

	return recommendedThemes || emptyList;
}
