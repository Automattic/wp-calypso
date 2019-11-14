/**
 * External dependencies
 */

import { get } from 'lodash';

export const getSiteBlocksCurrentPage = state => {
	const page = get( state, [ 'reader', 'siteBlocks', 'currentPage' ], 1 );

	if ( ! page ) {
		return 1;
	}

	return page;
};

export default getSiteBlocksCurrentPage;
