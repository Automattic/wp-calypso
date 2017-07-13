/**
 * External dependencies
 */
import { get } from 'lodash';

function getPagesState( state ) {
	return state.extensions.wpJobManager.pages;
}

/**
 * Returns true if we are fetching pages for the specified site ID, false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean} Whether pages are being fetched
 */
export function isFetchingPages( state, siteId ) {
	return get( getPagesState( state ), [ 'fetching', siteId ], false );
}

/**
 * Returns the pages for the specified site ID.
 *
 * @param  {Object} state Global state tree
 * @param  {Number} siteId Site ID
 * @return {Object} Pages
 */
export function getPages( state, siteId ) {
	return get( getPagesState( state ), [ 'items', siteId ], [] );
}
