/**
 * Internal dependencies
 */
import { receiveThemes } from 'calypso/state/themes/actions/receive-themes';

import 'calypso/state/themes/init';

/**
 * Returns an action object to be used in signalling that a theme object has
 * been received.
 *
 * @param  {object} theme  Theme received
 * @param  {number} siteId ID of site for which themes have been received
 * @returns {object}        Action object
 */
export function receiveTheme( theme, siteId ) {
	return receiveThemes( [ theme ], siteId );
}
