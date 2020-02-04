/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/reader/reducer';

export const getSiteBlocksLastPage = state => {
	return get( state, [ 'reader', 'siteBlocks', 'lastPage' ] );
};

export default getSiteBlocksLastPage;
