/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */

/**
 * Returns the editor of the selected site
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {String} "gutenberg" or "classic" or null
 */
export const getSelectedEditor = ( state, siteId ) =>
	get( state, [ 'selectedEditor', siteId ], null );
