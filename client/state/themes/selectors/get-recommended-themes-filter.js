import { isCoreFSEEligible } from 'calypso/state/gutenberg-fse-settings/selectors';

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
	return isCoreFSEEligible( state, siteId ) ? 'block-templates' : 'auto-loading-homepage';
}
