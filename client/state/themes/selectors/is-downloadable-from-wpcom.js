import { getTheme } from 'calypso/state/themes/selectors/get-theme';

import 'calypso/state/themes/init';

/**
 * Determine whether a zip of a given theme is hosted on
 * wpcom for download.
 * @param {Object} state Global state tree
 * @param {string} themeId Theme ID
 * @returns {boolean} true if zip is available on wpcom
 */
export function isDownloadableFromWpcom( state, themeId ) {
	const downloadUri = getTheme( state, 'wpcom', themeId )?.download ?? '';
	let hostname;
	try {
		hostname = new URL( downloadUri ).hostname;
	} catch {
		return false;
	}
	return hostname === 'wordpress.com' || hostname.endsWith( '.wordpress.com' );
}
