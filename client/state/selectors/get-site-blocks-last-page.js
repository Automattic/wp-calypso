/**
 * External dependencies
 */

import { get } from 'lodash';

export const getSiteBlocksLastPage = state => {
	return get( state, [ 'reader', 'siteBlocks', 'lastPage' ] );
};

export default getSiteBlocksLastPage;
