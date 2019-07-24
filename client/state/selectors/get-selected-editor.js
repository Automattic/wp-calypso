/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';
import { isEnabled } from 'config';

/**
 * Internal dependencies
 */

/**
 * Returns the editor of the selected site
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {String} "gutenberg-iframe", "gutenberg-redirect", "gutenberg-redirect-and-style" or "classic", or null if we
 * have no data yet
 */
export const getSelectedEditor = ( state, siteId ) => {
	const selectedEditor = get( state, [ 'selectedEditor', siteId ], null );

	const validEditors = [
		'gutenberg-iframe',
		'gutenberg-redirect',
		'gutenberg-redirect-and-style',
		'classic',
	];
	if ( ! validEditors.includes( selectedEditor ) ) {
		return null;
	}

	// Fallback to classic editor if we cannot redirect to WP Admin
	if (
		! isEnabled( 'gutenberg/redirect' ) &&
		[ 'gutenberg-redirect', 'gutenberg-redirect-and-style' ].includes( selectedEditor )
	) {
		return 'classic';
	}

	return selectedEditor;
};
