/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Gets the current ui locale variant
 * @param {Object} state - global redux state
 * @return {String?} current state value
 */
export default function getCurrentLocaleVariant( state ) {
	return get( state, 'ui.language.localeVariant', null );
}
