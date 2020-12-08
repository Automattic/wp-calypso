/**
 * External dependencies
 */
import { get } from 'lodash';
import { isEnabled } from 'calypso/config';

/**
 * Internal dependencies
 */
import isVipSite from 'calypso/state/selectors/is-vip-site';

/**
 * Indicates if the classic editor should be always loaded even if the selected editor for the given site is Gutenberg.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {boolean} Whether the classic editor is forced.
 */
export const isClassicEditorForced = ( state, siteId ) => {
	const selectedEditor = get( state, [ 'selectedEditor', siteId ], null );

	// Since the desktop app will open WP Admin pages in the browser, we force the classic editor if the site is not
	// eligible for Gutenframe in order to keep the user in the app.
	if (
		isEnabled( 'desktop' ) &&
		[ 'gutenberg-redirect', 'gutenberg-redirect-and-style' ].includes( selectedEditor )
	) {
		return true;
	}

	// We don't support Gutenberg on VIP sites.
	if ( isVipSite( state, siteId ) ) {
		return true;
	}

	return false;
};

export default isClassicEditorForced;
