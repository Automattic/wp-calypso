/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import isClassicEditorForced from 'state/selectors/is-classic-editor-forced';

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

	if ( isClassicEditorForced( state, siteId ) ) {
		return 'classic';
	}

	return selectedEditor;
};

export default getSelectedEditor;
