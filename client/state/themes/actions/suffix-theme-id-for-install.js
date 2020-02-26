/**
 * Internal dependencies
 */
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { isDownloadableFromWpcom } from 'state/themes/selectors';

import 'state/themes/init';

/**
 * Install of any theme hosted as a zip on wpcom must
 * be suffixed with -wpcom. Themes on AT sites are not
 * installed via downloaded zip.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @param {string} themeId Theme ID
 * @returns {string} the theme id to use when installing the theme
 */
export function suffixThemeIdForInstall( state, siteId, themeId ) {
	// AT sites do not use the -wpcom suffix
	if ( isSiteAutomatedTransfer( state, siteId ) ) {
		return themeId;
	}
	if ( ! isDownloadableFromWpcom( state, themeId ) ) {
		return themeId;
	}
	return themeId + '-wpcom';
}
