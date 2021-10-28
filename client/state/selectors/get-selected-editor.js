import config from '@automattic/calypso-config';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import 'calypso/state/selected-editor/init';

const VALID_EDITORS = [
	'gutenberg-iframe',
	'gutenberg-redirect',
	'gutenberg-redirect-and-style',
	'classic',
];
/**
 * Returns the editor of the selected site
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {string} "gutenberg-iframe", "gutenberg-redirect", "gutenberg-redirect-and-style" or "classic", or null if we
 * have no data yet
 */
export const getSelectedEditor = ( state, siteId ) => {
	const selectedEditor = state.selectedEditor[ siteId ] ?? null;

	if ( ! VALID_EDITORS.includes( selectedEditor ) ) {
		return null;
	}

	// Since the desktop app will open WP Admin pages in the browser, we force the classic editor if the site is not
	// eligible for Gutenframe in order to keep the user in the app.
	if (
		config.isEnabled( 'desktop' ) &&
		[ 'gutenberg-redirect', 'gutenberg-redirect-and-style' ].includes( selectedEditor )
	) {
		return 'classic';
	}

	// We don't support Gutenberg on VIP sites.
	if ( isVipSite( state, siteId ) ) {
		return 'classic';
	}

	return selectedEditor;
};

export default getSelectedEditor;
