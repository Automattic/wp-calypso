/** @format */
/**
 * External dependencies
 */

import { get } from 'lodash';

export const getSiteBlocksCurrentPage = state => {
	return get( state, [ 'reader', 'siteBlocks', 'currentPage' ], 1 );
};

export default getSiteBlocksCurrentPage;
