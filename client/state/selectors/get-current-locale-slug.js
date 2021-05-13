/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/ui/init';

/**
 * Gets the current ui locale slug
 *
 * @param {object} state - global redux state
 * @returns {string} current state value
 */
export default function getCurrentLocaleSlug( state ) {
	return get( state, 'ui.language.localeSlug', null );
}
