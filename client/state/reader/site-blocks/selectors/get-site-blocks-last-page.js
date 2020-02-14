/**
 * Internal dependencies
 */
import 'state/reader/init';

export const getSiteBlocksLastPage = state => {
	return state?.reader?.siteBlocks?.lastPage;
};

export default getSiteBlocksLastPage;
