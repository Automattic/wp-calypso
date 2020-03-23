/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Gets the current ui locale variant
 *
 * @param {object} state - global redux state
 * @returns {string?} current state value
 */
export default function getCurrentLocaleVariant( state ) {
	return get( state, 'ui.language.localeVariant', null );
}
