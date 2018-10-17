/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getRawSite from 'state/selectors/get-raw-site';

/**
 * Returns the editor of the selected site
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {String} "gutenberg" or "classic" or null
 */
export const getSiteEditor = ( state, siteId ) =>
	get( getRawSite( state, siteId ), 'editor', null );
