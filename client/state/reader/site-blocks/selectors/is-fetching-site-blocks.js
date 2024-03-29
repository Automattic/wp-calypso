import { get, filter } from 'lodash';

import 'calypso/state/reader/init';

/**
 * @param {Object} state Global state tree
 * @returns {boolean} true if we are fetching site blocks
 */
export default function isFetchingSiteBlocks( state ) {
	const inflightPages = get( state, [ 'reader', 'siteBlocks', 'inflightPages' ] );
	if ( ! inflightPages || inflightPages.length < 1 ) {
		return false;
	}

	const fetchingPages = filter( inflightPages, ( inflightPage ) => inflightPage === true );

	return fetchingPages.length > 0;
}
