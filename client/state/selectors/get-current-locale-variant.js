import { get } from 'lodash';

import 'calypso/state/ui/init';

/**
 * Gets the current ui locale variant
 *
 * @param {Object} state - global redux state
 * @returns {string?} current state value
 */
export default function getCurrentLocaleVariant( state ) {
	return get( state, 'ui.language.localeVariant', null );
}
