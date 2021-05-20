/**
 * Internal dependencies
 */
import isSiteUsingCoreSiteEditor from 'calypso/state/selectors/is-site-using-core-site-editor';
import 'calypso/state/themes/init';

/**
 * We currently support two types of theme filtering for recommended themes,
 * with the possibility of more in the future, which will require some
 * further work in this selector.
 *
 * @param {object}      state  Global state tree
 * @param {number|null} siteId Site ID
 * @returns {string}           The string to filter on in an API request.
 */
export function getRecommendedThemesFilter( state, siteId ) {
	const isUsingSiteEditor = isSiteUsingCoreSiteEditor( state, siteId );
	return isUsingSiteEditor ? 'block-templates' : 'auto-loading-homepage';
}
