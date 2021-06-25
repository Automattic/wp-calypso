/**
 * Internal dependencies
 */
import { THEME_UPLOAD_CLEAR } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

/**
 * Clears any state remaining from a previous
 * theme upload to the given site.
 *
 * @param {number} siteId -- site to clear state for
 *
 * @returns {object} the action object to dispatch
 */
export function clearThemeUpload( siteId ) {
	return {
		type: THEME_UPLOAD_CLEAR,
		siteId,
	};
}
