/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Gets the current ui locale slug
 * @param {Object} state - global redux state
 * @return {String} current state value
 */
export const getCurrentLocaleSlug = createSelector(
	state => state.ui.language.localeSlug
);
