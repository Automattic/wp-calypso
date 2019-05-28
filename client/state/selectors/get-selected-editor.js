/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';
import { isJetpackSite } from 'state/sites/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
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
	if ( validEditors.indexOf( selectedEditor ) === -1 ) {
		return null;
	}

	if ( isJetpackSite( state, siteId ) ) {
		if ( 'gutenberg-iframe' === selectedEditor && ! isEnabled( 'jetpack/gutenframe' ) ) {
			// Redirect to Calypsoified WP Admin block editor on Atomic sites when the feature flag is disabled.
			if ( isSiteAutomatedTransfer( state, siteId ) ) {
				return isEnabled( 'calypsoify/gutenberg' ) ? 'gutenberg-redirect-and-style' : 'classic';
			}

			// Redirect to WP Admin block editor on Jetpack sites when the feature flag is disabled.
			return 'gutenberg-redirect';
		}
	}

	return selectedEditor;
};
