/**
 * External dependencies
 *
 * @format
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Gets the current ui locale variant
 * @param {Object} state - global redux state
 * @return {String?} current state value
 */
const getCurrentLocaleVariant = createSelector(
	state => get( state, 'ui.language.localeVariant', null ),
	state => state.ui.language
);

export default getCurrentLocaleVariant;
