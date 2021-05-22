/**
 * Internal dependencies
 */
import { get } from 'lodash';
import { getActiveTheme } from 'calypso/state/themes/selectors/get-active-theme';

import 'calypso/state/themes/init';

/**
 * Returns true if the site is currently using a retired theme.
 *
 * @param  {object}   state    Global state tree
 * @param  {number}   siteId   The ID of the site we're querying
 * @returns {?boolean}          Whether the current theme is retired.
 */
export function isUsingRetiredTheme( state, siteId ) {
	return get(
		state,
		'themes.queries.wpcom.data.items.' + getActiveTheme( state, siteId ) + '.retired'
	);
}
