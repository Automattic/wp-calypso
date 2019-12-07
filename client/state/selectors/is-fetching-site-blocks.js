/** @format */

/**
 * External dependencies
 */
import { get, filter } from 'lodash';

/**
 * @param {Object} state Global state tree
 * @return {Boolean} true if we are fetching site blocks
 */
export default function isFetchingSiteBlocks( state ) {
	const inflightPages = get( state, [ 'reader', 'siteBlocks', 'inflightPages' ] );
	if ( ! inflightPages || inflightPages.length < 1 ) {
		return false;
	}

	const fetchingPages = filter( inflightPages, inflightPage => inflightPage === true );

	return fetchingPages.length > 0;
}
