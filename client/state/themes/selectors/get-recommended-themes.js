import isSiteUsingCoreSiteEditor from 'calypso/state/selectors/is-site-using-core-site-editor';
import { isJetpackSite } from 'calypso/state/sites/selectors';
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
	const sourceSiteId = siteId && isJetpackSite( state, siteId ) ? siteId : 'wpcom';
	const isUsingSiteEditor = isSiteUsingCoreSiteEditor( state, siteId );

	const blockThemes = state?.themes?.queries[ sourceSiteId ]?.getItemsIgnoringPage( {
		filter: 'block-templates',
	} );

	const classicThemes = state?.themes?.queries[ sourceSiteId ]?.getItemsIgnoringPage( {
		filter: 'auto-loading-homepage',
	} );

	let recommendedThemes = [];

	if ( blockThemes && isUsingSiteEditor ) {
		recommendedThemes = [ ...recommendedThemes, ...blockThemes ];
	}

	if ( classicThemes ) {
		recommendedThemes = [ ...recommendedThemes, ...classicThemes ];
	}

	return recommendedThemes || emptyList;
}
