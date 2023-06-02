import { get } from 'lodash';

import 'calypso/state/reader/init';

export const getSiteBlocksLastPage = ( state ) => {
	return get( state, [ 'reader', 'siteBlocks', 'lastPage' ] );
};

export default getSiteBlocksLastPage;
